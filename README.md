DREAM-PI
====
# Principle

Specimen-ID is delivered from barcode reader to Imoko (web page) and Medusa via
following path.

- CR 3500 (barcode reader) [bluetooth] DREAM PI (pub_rfcomm.js)
- DREAM PI (pub_rfcomm.js) [PubNub] Imoko (web page)
- DREAM PI (pub_rfcomm.js) [TCP/IP] Medusa

Quantity of the specimen is delivered from balances to Imoko (web page) and Medusa
via following path.

- MS 16002S (balance) [RS232C/USB] DREAM PI
- DREAM PI (weigh.js) [PubNub] Imoko (web page)
- DREAM PI (weigh.js) [TCP/IP] Medusa

To ensure reliable connection between DREAM PI and Bluetooth, we
encourage an user to restart DREAM PI before operation.  To restart DREAM
PI, make sure if a process `weigh_console.js` is running on DREAM PI.

The process can be monitored by web page referred as `Imoko` (web
page) that runs on http://devel.misasa.okayama-u.ac.jp/io/.
Practically this is the only interface that lets an user restart DREAM
PI.

# Operation

1. Open web page http://devel.misasa.okayama-u.ac.jp/io/.
2. Click Start to reboot DREAM PI.
3. Scan connection code to hear beep twice.
4. Scan specimen-ID.
5. Put a specimen on a balance.
6. Push Weigh button.  Confirm if quantity was updated.

# Description

As of January 19, 2018, one computer (Raspberry Pi) can communicate
with two balances and one barcode reader at once.

## Barcode reader

As of May 24, 2017, Code CR 2500, CR 3500 and CR 2600 are supported.
Note that before for the first connection, pincode authorization is
required for each device.

## Balance (METTLER TOLEDO MS1602S)

Enable `HOST` mode to communicate using RS-232C.

## Balance (AND FG-30KBM)

Enable `COMMAND` mode to communicate using RS-232C.

## Imoko (web page)

When weight button is pressed, via TCP/IP, Imoko (web page) reads specimen-ID and
weight on `PubNub` channels a and b. Then Imoko (web page) asks computer
(Raspberry Pi) to update weight of specimen with the specimen-ID on
Medusa.

## Computer (Raspberry Pi)

Computer (Raspberry Pi) talks with devices via device files of `Bluetooth` and
`USB`, with Imoko (web page) via TCP/IP, and with Medusa via TCP/IP.

- Barcode reader: Via device file `/dev/rfcomm0`, computer (Raspberry
  Pi) receives specimen-ID from barcode reader through Bluetooth and
  publishes it to `PubNub` channel-a.
- Balances: Via device files `/dev/ttyUSB`?, computer (Raspberry Pi)
  receives weight from balances (METTLER TOLEDO MS1602S or/and AND
  FG-30KBM) through RS232C and publishes it to `PubNub` channel-b.


# Configure a DREAM PI

## Services

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

## RS232C-USB connection

The balances should talk to the computer by USB via RS232C.  A
RS232C-USB converter (REX-USB60F) should be installed.

Name of the USB device file is temporal and fragile.  To talk to
the balances, make a symbolic link to the device file dynamically, and
refer to the link instead of the device file from application.

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
