dream_io
====
# Principle

Specimen-ID is delivered from barcode reader to Medusa via following
path.

- CR 2600 (barcode reader) <Bluetooth> DREAM I/O (weigh.js)
- DREAM I/O (weigh.js) <TCP/IP> Medusa

Quantity of the specimen is delivered from balance to Medusa via
following path.

- MS 16002S (balance) <RS232C/USB> DREAM I/O
- DREAM I/O (weigh.js) <TCP/IP> Medusa

The process can be monitored by web server that runs on DREAM I/O.
This interface lets user reset the DREAM I/O.

- DREAM I/O (weigh_consle.js)

# Configuration

## CR 2600 (barcode reader)

## MS 16002S (balance)

## DREAM I/O

Listen to two devices.

- listen `rfcomm0': Receive specimen-ID from barcode reader via
  Bluetooth.
- listen `ttyUSB0': Receive weight from balance via RS232C.

### Instalation
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
    $ sudo cp ./systemd/system/weigh.service /etc/systemd/system/
    $ sudo cp ./systemd/system/weigh_console.service /etc/systemd/system/
    $ sudo systemctl daemon-reload
    $ sudo systemctl enable weigh.service
    $ sudo systemctl enable weigh_console.service
    $ sudo systemctl start listen_rfcomm0.service
    $ sudo systemctl start weigh.service
    $ sudo systemctl start weigh.service

# Operation manual

1. Open web page (as of April 28, 2017, 172.24.1.130).
2. Click Start
3. Scan connection code to hear beep twice.
4. Put a specimen.
5. Scan specimen-ID.  Confirm if quantity was updated.
