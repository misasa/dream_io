dream_io
====
# Principle

Specimen-ID is delivered from barcode reader to Medusa via following
path.

- CR 2600 (barcode reader) <Bluetooth> DREAM I/O (listen_rfcomm0)
- DREAM I/O (gateway_rfcomm0) <TCP/IP> PC (weigh)
- PC (weigh) <TCP/IP> Medusa

Quantity of the specimen is delivered from balance to Medusa via
following path.

- MS 16002S (balance) <RS232C/USB> DREAM I/O
- DREAM I/O (gateway_ttyUSB0) <TCP/IP> PC (weight)
- PC (weight) <TCP/IP> Medusa

# Configuration

## CR 2600 (barcode reader)

## MS 16002S (balance)

## DREAM I/O

Three services are involved.

- listen_rfcomm0: Receive specimen-ID from barcode reader via
  bluetooth.
- gateway_rfcomm0: Write the specimen-ID to TCP/IP port (2002 as of
  April 18, 2017).
- gateway_ttyUSB0: Relay communication between RS232C and TCP/IP port
  (2001 as of April 18, 2017).

    $ lsb_release -a
    Distributor ID: Raspbian
    Description:    Raspbian GNU/Linux 8.0 (jessie)
    Release:        8.0
    Codename:       jessie
    $ git clone https://github.com/misasa/dream_io
    $ cd dream_io
    $ sudo cp ./udev/rules.d/rfcomm.rules /etc/udev/rurles.d/
    $ sudo cp ./systemd/system/listen_rfcomm0.service /etc/systemd/system/
    $ sudo cp ./systemd/system/gateway_rfcomm0.service /etc/systemd/system/
    $ sudo cp ./systemd/system/geteway_ttyUSB0.service /etc/systemd/system/
    $ sudo systemctl enable listen_rfcomm0.service
    $ sudo systemctl enable gateway_rfcomm0.service
    $ sudo systemctl enable tageway_ttyUSB0.service
    $ sudo systemctl start listen_rfcomm0.service
    $ sudo systemctl start gateway_rfcomm0.service
    $ sudo systemctl start gateway_ttyUSB0.service

## PC (weigh)

Revise configuration file "~/.orochirc" to include following line.

    ### Medusa server
    uri: dream.misasa.okayama-u.ac.jp/demo
    user: admin
    password: admin
    
    ## DREAM I/O
    dream_io: 172.24.1.130

Then launch client application.

    $ ./example/weigh

How to put weigh of a specimen into Medusa is shown below.

1. Put a specimen on a balance.
2. Scan specimen-ID by barcode reader.
3. A web page that corresponds to the specimen-ID will shown up.
   Confirm if quantity was updated.
