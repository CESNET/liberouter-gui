# Security Cloud
## Architecture
### Roles
A guest can view graphs and statistics. He can also view profile configurations.
User can also query database, create new subprofiles and modify existing profiles.
Administrator can also delete existing profiles.

### Routes
#### scgui/profiles
GET - Will return JSON formatted data about all profiles in format: name, path, parent, channels { name, filter, sources }

POST with profile path argument and data. Will create new subprofile of mentioned profile.

PUT with profile path argument and data. Will modify mentioned profile with new data.

DELETE with profile path argument. Will delete mentioned profile.

#### scgui/graph
GET with profile path, from time, to time, variable and result pixel size. This will use rrdtool
to retrieve graph data for all channels of a profile and returns them as JSON.

#### scgui/stats
GET with profile name, from time, to time. This will use rrdtool to retrieve
statistics for all channels of a profile for and returns them as JSON.
( Rates and Sums for flows, traffic and packets for all channels and total count )

#### scgui/query/instance
GET with profile name, channel selection, filter and options. This will query
fdistdump with given arguments. instance is a ID of a current browser tab of a 
user and is used as a index of PID of fdisdump. Will be used in case user wants
to stop a long query. Result of a query will be returned as raw text enriched with
HTML tags for displaying IP whois. Angular should treat this as trusted html.

DELETE this will kill a running fdistdump query (if it is still running).

#### scgui/query/fields
GET this will retrieve all arguments that can be used for aggregation/order by in
fdistdump.