dream_io
====

## Install
    > lsb_release -a
    Distributor ID: Raspbian
    Description:    Raspbian GNU/Linux 8.0 (jessie)
    Release:        8.0
    Codename:       jessie
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

## Usage
    > ./example/quantify_stone


    
