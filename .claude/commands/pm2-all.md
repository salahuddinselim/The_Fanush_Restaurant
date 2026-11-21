Start all services and open PM2 monitor.
```bash
cd "C:/Users/User/Desktop/Mine/restaurant-site" && pm2 start ecosystem.config.cjs && start wt.exe -d "C:/Users/User/Desktop/Mine/restaurant-site" pwsh -NoExit -c "pm2 monit"
```
