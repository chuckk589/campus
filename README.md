<!-- # Installation
- ## Setting up systemctl service
    > This is necessary to update ufw rules every time the server restarts and docker container ip changes.
    1. ### install ufw-docker
        https://github.com/chaifeng/ufw-docker?tab=readme-ov-file#ufw-docker-util

    2. ### set up ufw rule service
        ```bash
        nano /etc/systemd/system/ufw-update.service
        ```
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
    3. ### run service
        ```bash
        chmod +x ufw.sh
        systemctl enable ufw-update.service
        systemctl start ufw-update.service
        ```
- ## run app
    ```bash
    bash dbp.sh
    ``` -->
    
