"""Regression tests for OWASP security controls."""
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch



sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import auth, main, models
from app.database import get_db
from app.utils.upload import safe_upload_path


class SecurityTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        models.Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        app = main.app
        app.dependency_overrides[get_db] = self._db
        self.client = TestClient(app, raise_server_exceptions=False)
        main._request_counts.clear()

    def tearDown(self):
        main.app.dependency_overrides.clear()
        self.engine.dispose()

    def _db(self):
        db = self.Session()
        try:
            yield db
        finally:
            db.close()

    def _add_review(self):
        db = self.Session()
        review = models.Review(name="Victim", rating=5, comment="original")
        db.add(review)
        db.commit()
        review_id = review.id
        db.close()
        return review_id

    def test_unauthenticated_review_delete_is_denied(self):
        review_id = self._add_review()
        response = self.client.delete(f"/reviews/{review_id}")
        self.assertIn(response.status_code, (401, 403))

    def test_login_response_never_contains_the_token(self):
        db = self.Session()
        db.add(models.User(username="admin", hashed_password=auth.hash_password("correct-horse")))
        db.commit()
        db.close()
        response = self.client.post("/auth/login", json={"username": "admin", "password": "correct-horse"})
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("access_token", response.json())
        self.assertIn("session_token", response.cookies)

    def test_login_rejects_long_and_short_passwords(self):
        for password in ("short", "x" * 80):
            response = self.client.post("/auth/login", json={"username": "admin", "password": password})
            self.assertEqual(response.status_code, 422)

    def test_password_hashing_rejects_bcrypt_truncation_range(self):
        with self.assertRaises(ValueError):
            auth.hash_password("a" * 73)
        self.assertFalse(auth.verify_password("a" * 80, auth.hash_password("a" * 12)))

    def test_upload_path_cannot_escape_upload_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            self.assertEqual(
                Path(safe_upload_path(directory, "image.png")).parent.resolve(),
                Path(directory).resolve(),
            )
            with self.assertRaises(Exception):
                safe_upload_path(directory, "../../secrets.txt")

    def test_jwt_secret_fails_closed(self):
        with patch.dict(os.environ, {"JWT_SECRET_KEY": "short"}):
            with self.assertRaises(RuntimeError):
                auth._load_secret()

    def test_security_headers_are_present(self):
        response = self.client.get("/config")
        self.assertEqual(response.headers.get("X-Frame-Options"), "DENY")
        self.assertEqual(response.headers.get("X-Content-Type-Options"), "nosniff")
        self.assertIn("frame-ancestors 'none'", response.headers.get("Content-Security-Policy", ""))

    def test_admin_data_is_not_publicly_cacheable(self):
        db = self.Session()
        db.add(models.User(username="admin", hashed_password=auth.hash_password("correct-horse")))
        db.commit()
        db.close()
        token = auth.create_access_token({"sub": "admin"})
        self.client.cookies.set("session_token", token)
        response = self.client.get("/menu/categories/all")
        self.assertEqual(response.status_code, 200)
        self.assertIn("no-store", response.headers.get("Cache-Control", ""))
        self.client.cookies.clear()


if __name__ == "__main__":
    unittest.main()
