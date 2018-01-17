DREAM-PI
====
# Principle

Specimen-ID is delivered from barcode reader to Medusa and Imoko via
following path.

- CR 3500 (barcode reader) <bluetooth> DREAM PI (pub_rfcomm.js)
- DREAM PI (pub_rfcomm.js) <TCP/IP> Medusa
- DREAM PI (pub_rfcomm.js) <PubNub> Imoko

Quantity of the specimen is delivered from balance to Medusa and Imoko
via following path.

- MS 16002S (balance) <RS232C/USB> DREAM PI
- DREAM PI (weigh.js) <TCP/IP> Medusa
- DREAM PI (weigh.js) <PubNub> Imoko

To ensure reliable connection between DREAM PI and Bluetooth, we
encourage an user to restart DREAM PI before operation.  To restart DREAM
PI, make sure if following application runs on DREAM PI.

- DREAM PI (weigh_console.js)

The process can be monitored by web server referred as Imoko that runs
on http://devel.misasa.okayama-u.ac.jp/io/.  Practically this is the
only interface that lets an user restart DREAM PI.

# Operation manual

1. Open web page http://devel.misasa.okayama-u.ac.jp/io/.
2. Click Start to reboot DREAM PI.
3. Scan connection code to hear beep twice.
4. Scan specimen-ID.
5. Put a specimen.
6. Push Weigh button.  Confirm if quantity was updated.

# Configuration

## Barcode reader

As of May 24, 2017, Code CR 2500, CR 3500 and CR 2600 are supported.
Note that before for the first connection, pincode authorization is
required for each device.

## METTLER TOLEDO MS1602S (light balance)

Enable communication using RS-232C.  Turn on `HOST` mode.

## AND FG-30KBM (heavy balance)

Enable comunication using RS-232C. Turn on `COMMAND` mode.

## DREAM PI (Raspberry Pi)

DREAM PI listens two devices as shown below.

- listen `rfcomm0': Receive specimen-ID from barcode reader via
  Bluetooth.
- listen `ttyUSB0': Receive weight from balance via RS232C.

Install and activate services as shown below.

    $ lsb_release -a
    Distributor ID: Raspbian
    Description:    Raspbian GNU/Linux 8.0 (jessie)
    Release:        8.0
    Codename:       jessie
    $ git clone https://github.com/misasa/dream_io
    $ cd dream_io
    $ sudo cp -r ./nodejs /srv/
    $ sudo cp /srv/nodejs/config/default.yaml.example /srv/nodejs/config/default.yaml
    $ sudo cp ./udev/rules.d/rfcomm.rules /etc/udev/rurles.d/
    $ sudo apt-get install nodejs npm
    $ sudo npm cache clean
    $ sudo npm install n -g
    $ sudo n stable
    $ sudo ln -sf /usr/local/bin/node /usr/bin/node
    $ node -v
    v9.2.1
    $ sudo apt-get install libbluetooth-dev
    $ cd /srv/nodejs
    $ sudo npm install
    $ sudo cp ./systemd/system/nodejs_rfcomm.service /etc/systemd/system/
    $ sudo cp ./systemd/system/weigh.service /etc/systemd/system/
    $ sudo cp ./systemd/system/weigh_console.service /etc/systemd/system/
    $ sudo systemctl daemon-reload
    $ sudo systemctl enable nodejs_rfcomm.service
    $ sudo systemctl enable weigh.service
    $ sudo systemctl enable weigh_console.service
    $ sudo systemctl start nodejs_rfcomm.service
    $ sudo systemctl start weigh.service
    $ sudo systemctl start weigh_console.service

Revise configuration file (/srv/nodejs/config/default.yaml) when
necessary.

## Refer to USB port

Name of device file by USB is temporal.  To refer to device on USB,
make symbolic link to the device file, and refer to the link instead
of device file from application.

    $ sudo vi /etc/udev/rules.d/99-usb-serial.rules
    $ cat /etc/udev/rules.d/99-usb-serial.rules
    SUBSYSTEM=="tty", ATTRS{idVendor}=="067b", ATTRS{idProduct}=="2303", SYMLINK+="balance0"
    SUBSYSTEM=="tty", ATTRS{idVendor}=="0584", ATTRS{idProduct}=="b020", SYMLINK+="balance1"
    $ cat config/default.yaml
    config:
      balance:
        - name: "AND FG-30KBM"
          port: "/dev/balance0"
          options:
            baudRate: 2400
            dataBits: 7
            parity: 'even'
          delimiter: "\r\n"
          command: "Q\r\n"
        - name: "METTLER TOLEDO MS1602S"
          port: "/dev/balance1"
          options:
            baudRate: 9600
          delimiter: "\r\n"
          command: "S\r\n"
