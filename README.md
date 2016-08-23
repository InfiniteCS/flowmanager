# ![Flow Manager](https://github.com/radhika-s/images/blob/master/flowmanager/flowmanager_logo.png)

## What is Flow Manager?
Flow Manager is a northbound application sub-system that can be used by Network Administrators or Traffic Monitoring & Optimization applications to push fine-grained and customized  flows to OpenFlow enabled devices in the SDN network. Flow Manager currently supports Openflow ver 1.3.4.  

###Features:
+ Provides a simple solution to create and push flows to a SDN controller using web-based UI
+ Helps simplify managing the flows in the SDN controller
+ Deletes existing flows in the network
+ Supports REST APIs that enable simple integration into SDN controllers
+ View the flow structure in the form of JSON for validation

![Flow Manager Design](https://github.com/radhika-s/images/blob/master/flowmanager/flowmanager_design.png)

##Prerequisites:
Following are the softwares/packages required for Flow Manager Applicaiton

+ NodeJS
```
  $ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  $ sudo apt-get install -y nodejs
```
+ NPM

> **Note:** should install latest version with nodejs installation. If not, use the following.

```
  $ sudo npm install npm@latest -g
```
+ Bower
```
  $ npm install bower -g
```
+ Confirm installation:
```
  $ node -v && npm -v && bower -v
```
## Installation:
```
$ git clone https://github.com/InfiniteCS/flowmanager.git
$ cd flowmanager
$ npm install # use root priviledges if necessary
$ bower install
```

> **Note:** If bower installation fails due to priviledges, use

> $ sudo bower install --allow-root

## Running:
```
$ sudo gulp serve
[19:46:56] Using gulpfile ~/flowmanager/gulpfile.js
[19:46:56] Starting 'scripts'...
[19:46:56] Starting 'styles'...
[19:46:57] gulp-inject Nothing to inject into index.scss.
[19:46:57] Finished 'styles' after 539 ms
[19:46:57] all files 111.37 kB
[19:46:57] Finished 'scripts' after 559 ms
[19:46:57] Starting 'inject'...
[19:46:57] gulp-inject 1 files into index.html.
[19:46:57] gulp-inject 11 files into index.html.
[19:46:57] Finished 'inject' after 164 ms
[19:46:57] Starting 'watch'...
[19:46:57] Finished 'watch' after 32 ms
[19:46:57] Starting 'serve'...
[19:46:57] Finished 'serve' after 24 ms
[BS] [BrowserSync SPA] Running...
[BS] Access URLs:
 -----------------------------------
    Local: http://localhost:3000/
 External: http://172.27.1.3:3000/
 -----------------------------------
[BS] Serving files from: .tmp/serve
[BS] Serving files from: src
```
## OpenFlow Features Support
|Category|Field Names|
| ------------- | ------------- |
| Base | Switch ID, Flow Name, Priority, Flow ID, Table ID, Hard Timeout, Idle Timeout, Cookie, Cookie Mask, Strict, Barrier, InstallHW |
| Match     | <ul><li>**Pipeline:** Switch Input port, Metadata, Metadata Mask, Tunnel ID</li><li> **Ethernet:** Source MAC Address, Destination MAC Address, Ethernet Frame Type, VLAN ID, VLAN Priority, VLAN ID present </li><li>**IP:** IP Protocol, IPv4 Source Address, IPv4 Destination Address, IP DSCP, IP ECN, IPv6 Source Address, IPv6 Destination Address, IPv6 Label, IPv6 Ext Header </li><li>**Transport:** TCP Source Port, TCP Destination Port, UDP Source Port, UDP Destination Port  </li><li>**ICMP:** ICMPv4 Type, ICMPv4 Code, ICMPv6 Type, ICMPv6 Code</li><li>**ARP:** ARP Operation, ARP Source Transport Address, ARP Target Transport Address, ARP Source Hardware Address, ARP Target Hardware Address</li><li>**MPLS:** MPLS Label, MPLS Traffic Class, MPLS Bottom of Stack</li></ul> |
| Action  | <ul><li>**Output:** Any, Table, Import, Physical Port, Local, Normal, Flood, Controller, All, Max Length</li><li>**Push VLAN:** Ethernet Type, VLAN ID, VLAN ID Present</li><li>**Push MPLS:** Ethernet Type, MPLS Label</li><li>**Pop MPLS:** Ethernet Type</li><li>**Swap MPLS:** MPLS Label</li><li>**Drop**</li></ul>  |

## Questions?
Send questions or feedback to: `Akshil.Verma@infinite.com` or `Dhanasekar.Kandasamy@infinite.com`

Found any issue or suggest any enhancement, [Click here.](https://github.com/InfiniteCS/flowmanager/issues/new)

## Flow Manager Pro Edition:

> **Pro Editon Featues:**
>
> - Support for All Match and Action fields (Based on OpenFlow ver 1.3.4)
> - Edit Flow Support
> - Network Topology Visualization
> 
> **Pro Edition Contact:**
>
> - Radhika Sampath : `sRadhika@infinite.com` or `sales@infinite.com`
