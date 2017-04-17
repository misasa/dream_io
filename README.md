dream_io
====
Overview

## Install
    > git clone https://github.com/misasa/dream_io
    > cd dream_io
    > sudo cp ./systemd/system/rfcomm.service
    > sudo cp ./systemd/system/rfcommgw.service
    > sudo cp ./systemd/system/ttyUSBgw.service
    > sudo systemctl enable rfcomm.service
    > sudo systemctl enable rfcommgw.service
    > sudo systemctl enable ttyUSBgw.service
    > sudo systemctl start rfcomm.service
    > sudo systemctl start rfcommgw.service
    > sudo systemctl start ttyUSBgw.service


    
