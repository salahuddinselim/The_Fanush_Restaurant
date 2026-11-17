import os
import unittest
from importlib import reload
from unittest.mock import patch

from starlette.middleware.cors import CORSMiddleware

from app import main


class CorsConfigTests(unittest.TestCase):
    def load_cors_kwargs(self, configured_origins):
        with patch.dict(os.environ, {}, clear=False):
            if configured_origins is None:
                os.environ.pop('CORS_ALLOW_ORIGINS', None)
            else:
                os.environ['CORS_ALLOW_ORIGINS'] = configured_origins
            reload(main)

        cors = next(middleware for middleware in main.app.user_middleware if middleware.cls is CORSMiddleware)
        return cors.kwargs

    def test_default_cors_allows_local_development_origins(self):
        kwargs = self.load_cors_kwargs(None)

        self.assertEqual(kwargs['allow_origins'], ['http://localhost:4200', 'http://127.0.0.1:4200'])
        self.assertTrue(kwargs['allow_credentials'])

    def test_cors_origins_can_be_configured_by_environment(self):
        kwargs = self.load_cors_kwargs('https://one.example.com, https://two.example.com,')

        self.assertEqual(kwargs['allow_origins'], ['https://one.example.com', 'https://two.example.com'])


if __name__ == '__main__':
    unittest.main()
