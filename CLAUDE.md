# Restaurant Site — Claude Notes

## PM2 Services

| Port | Name | Type |
|------|------|------|
| 4200 | restaurant-frontend-4200 | Angular (ng serve) |
| 8000 | restaurant-backend-8000 | FastAPI (uvicorn) |

**Terminal Commands:**
```bash
pm2 start ecosystem.config.cjs   # First time
pm2 start all                    # After first time
pm2 stop all / pm2 restart all
pm2 start restaurant-frontend-4200 / pm2 stop restaurant-frontend-4200
pm2 start restaurant-backend-8000 / pm2 stop restaurant-backend-8000
pm2 logs / pm2 status / pm2 monit
pm2 save                         # Save process list
pm2 resurrect                    # Restore saved list
```

**Claude Commands:** `/pm2-all`, `/pm2-all-stop`, `/pm2-4200`, `/pm2-4200-stop`, `/pm2-8000`, `/pm2-8000-stop`, `/pm2-logs`, `/pm2-status`
