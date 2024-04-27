## install ufw-docker

https://github.com/chaifeng/ufw-docker?tab=readme-ov-file#ufw-docker-util

## set up ufw rule service

nano /etc/systemd/system/ufw-update.service

```bash
[Unit]
Description=Campus ufw update service

[Service]
Type=oneshot
ExecStart=/root/campus/ufw.sh
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

systemctl enable ufw-update.service<br />
systemctl start ufw-update.service<br />
