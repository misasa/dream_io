# DREAM-PI

DREAM-PI is a device that provides PubNub interfaces https://www.pubnub.com/ to
barcode reader, balances, and NFC reader/writer.

====
# Description
DREAM-PI is a device that provides PubNub interfaces https://www.pubnub.com/ to
barcode reader, balances, and NFC reader/writer.  As of January 25,
2018, we use computer (Raspberry Pi) as an infrastructure.

As an example of applications of DREAM-PI, we develop a web interface
named Imoko.  He transfers quantity of a specimen weighted in balance
into Medusa using DREAM-PI.

As of January 19, 2018, one computer (Raspberry Pi) can communicate
with two balances and one barcode reader at once.

# Principle

Specimen-ID is delivered from barcode reader to Imoko (web interface) and Medusa via
following path.

- CR 3500 (barcode reader) [bluetooth] DREAM-PI (pub_rfcomm.js)
- DREAM-PI (pub_rfcomm.js) [PubNub] Imoko (web interface)
- DREAM-PI (pub_rfcomm.js) [TCP/IP] Medusa

Quantity of the specimen is delivered from balance to Imoko (web interface) and Medusa
via following path.

- MS 16002S (balance) [RS232C/USB] DREAM-PI
- DREAM-PI (weigh.js) [PubNub] Imoko (web interface)
- DREAM-PI (weigh.js) [TCP/IP] Medusa

To ensure reliable connection between DREAM-PI and Bluetooth, we
encourage an user to restart DREAM-PI before operation.



# Operation

1. Open Imoko (web interface) http://devel.misasa.okayama-u.ac.jp/io/.
2. Click `Start` to reboot DREAM-PI.
3. Scan connection code to hear beep twice.
4. Scan specimen-ID.
5. Put a specimen on a balance.
6. Push `Weigh` button.  Confirm if quantity was updated.

## Barcode reader

As of May 24, 2017, Code CR 2500, CR 3500 and CR 2600 are supported.
Note that before for the first connection, authorization is
required for each device.

## Balance (METTLER TOLEDO MS1602S)

Enable `HOST` mode to communicate using RS-232C.

## Balance (AND FG-30KBM)

Enable `COMMAND` mode to communicate using RS-232C.

## Computer (Raspberry Pi)

### Overview

Computer (Raspberry Pi) talks to barcode reader and balances via
device files of `Bluetooth` and `USB`, to channels by `PubNub`, and to
Medusa via TCP/IP.

- Barcode reader: Via device file `/dev/rfcomm0`,
  computer (Raspberry Pi) receives specimen-ID from barcode reader
  through Bluetooth and publishes it to `PubNub` channel-a.  Via
  TCP/IP, computer asks Medusa to solve specimen-ID.
- Balances: Via device files `/dev/ttyUSB`?, computer
  (Raspberry Pi) receives weight from balances (METTLER TOLEDO MS1602S
  or/and AND FG-30KBM) through RS232C and publishes it to `PubNub`
  channel-b.  Via TCP/IP, computer updates quantity of a specimen with
  the specimen-ID on Medusa.

### Configure services

Install and activate services as shown below.  Revise configuration
file (/srv/nodejs/config/default.yaml) when necessary.

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


### Configure USB-RS232C connection

The balances should talk to the computer by USB via RS232C.  A
RS232C-USB converter (REX-USB60F) should be installed.

Name of the USB device file is temporal and fragile.  To talk to
the balances, make a symbolic link to the device file dynamically, and
refer to the link instead of the device file from application.

    $ sudo vi /etc/udev/rules.d/99-usb-serial.rules
    $ cat /etc/udev/rules.d/99-usb-serial.rules
    SUBSYSTEM=="tty", ATTRS{idVendor}=="067b", ATTRS{idProduct}=="2303", SYMLINK+="balance0"
    SUBSYSTEM=="tty", ATTRS{idVendor}=="0584", ATTRS{idProduct}=="b020", SYMLINK+="balance1"


### Example of configuration file

    $ cat nodejs/config/default.yaml
    config:
      pubnub:
        publishKey: "demo"
        subscribeKey: "demo"
      medusa:
        url: "http://dream.misasa.okayama-u.ac.jp/demo/"
        auth:
          user: "admin"
          password: "admin"
      tepra:
        url: "http://172.24.1.121:8889/"
        printer: "KING JIM SR5900P"
        template: "18x18"
      balance:
        - name: "METTLER TOLEDO MS1602S"
          port: "/dev/balance1"
          options:
            baudRate: 9600
          delimiter: "\r\n"
          command: "S\r\n"
        - name: "AND FG-30KBM"
          port: "/dev/balance0"
          options:
            baudRate: 2400
            dataBits: 7
            parity: 'even'
          delimiter: "\r\n"
          command: "Q\r\n"

## Imoko (web interface)

Imoko (web interface) monitors a specimen message via TCP/IP on
`PubNub` channel a, that consists of ID and name, and shows the
specimen ID and the name.

Imoko (web interface) reads a weight message via TCP/IP on `PubNub`
channel b when `Weight` button is pressed, and shows the weight.

Then Imoko (web page) asks computer (Raspberry Pi) to update the
weight of the specimen on Medusa.
