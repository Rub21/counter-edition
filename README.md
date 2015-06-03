# Counter OSM edition

### How to run:

```
git clone https://github.com/Rub21/counter-edition.git
cd counter-edition/
npm install

```

- Get data from http://download.geofabrik.de/

Example: 

http://download.geofabrik.de/asia/nepal-latest.osm.pbf

or any other OSM data file and save on `counter-edition`


- Get timestamp from http://www.unixtimestamp.com/index.php

Example :

![image](https://cloud.githubusercontent.com/assets/1152236/7965571/ff75cff0-09e3-11e5-98ad-4eab014004de.png)

```
$ node index.js --file=nepal-latest.osm.pbf

```

*The result is:*

 https://github.com/Rub21/counter-edition/blob/master/nepal-latest-count.md

*If you want change the user just edit the file:*

https://github.com/Rub21/counter-edition/blob/master/users.js

