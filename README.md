dream_io
====
# Principle

Specimen-ID is delivered from barcode reader to Medusa via following
path.

- CR 3500 (barcode reader) <Bluetooth> DREAM IO (weigh.js)
- DREAM IO (weigh.js) <TCP/IP> Medusa

Quantity of the specimen is delivered from balance to Medusa via
following path.

- MS 16002S (balance) <RS232C/USB> DREAM IO
- DREAM IO (weigh.js) <TCP/IP> Medusa

The process can be monitored by web server referred as DREAM manager
that runs on http://devel.misasa.okayama-u.ac.jp/io/.  This interface
also lets user restart the DREAM IO.

- devel.misasa.okayama-u.ac.jp (DREAM manager, /io/index.html)
- DREAM IO (weigh_console.js)

# Operation manual

1. Open web page http://devel.misasa.okayama-u.ac.jp/io/.
2. Click Start to reboot DREAM IO.
3. Scan connection code to hear beep twice.
4. Put a specimen.
5. Scan specimen-ID.  Confirm if quantity was updated.

# Configuration

## CR 3500 (barcode reader)

See somewhere else.  As of May 8, 2017, CR 2600 is not supported.

## MS 16002S (balance)

Enable communication using RS-232C.  Turn on `HOST` mode.

## DREAM IO (Raspberry Pi)

DREAM IO listens two devices as shown below.

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
    $ sudo cp ./systemd/system/weigh.service /etc/systemd/system/
    $ sudo cp ./systemd/system/weigh_console.service /etc/systemd/system/
    $ sudo systemctl daemon-reload
    $ sudo systemctl enable weigh.service
    $ sudo systemctl enable weigh_console.service
    $ sudo systemctl start weigh.service
    $ sudo systemctl start weigh_console.service
