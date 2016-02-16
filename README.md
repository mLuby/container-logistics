# NOTES:
- to run: `$ npm install && npm start` # (should open 0.0.0.0:8080/dist and display maps)
- There is a `\r` after the first line of nodes.csv.
- Noticed that my maps show routes that the example does not (for example Champlain 15hrs has a route from Evanston to Bismark to Champlaign in 14.15 hrs). Perhaps the example is showing only the fastest routes?
- Currently clearing and redrawing all the nodes and edges. Would be much more efficient to keep track of the current active ones, then only change those and the new active ones.
- Minuglified mapbox.js complains if lib/images/icons etc isn't present—ideally would fix that path upstream.
- Using webpack/redux build tools because I thought I'd use react for this, but it was unnecessary.
- Main calculation function `inRange` could gain significant performance by using Maps to avoid having to dedup.
- 3D globe API does not have a way to remove polygons or to clear everything, which is why the red lines persist. Given more time, could dig into the underlying libs to fix this.

# SUMMARY
You’re an equipment manager at a shipping carrier, and one of your main functions is ensuring that every location has sufficient containers available. However, things often go wrong, and you need to be able to quickly replenish inventory from nearby cities.  Since you want to be efficient, you’ve decided to build a tool to help you determine which cities would be close enough to supply containers to the location in need.  To make things clear, we’ve broken down the challenge into two primary tasks.

(you can find an example implementation at http://full-stack-coding-challenge-example.s3-website-us-west-2.amazonaws.com)

# TASK 1
Goal: visualize graph of cities on a web page as a map

You will read in a series of nodes (cities) and edges (a railroad connecting two cities) and then display them on a map of the United States (you will use the nodes.csv file and the edges.csv file).

The nodes.csv file has the following columns
 - id (Integer)
 - city_name (String)
 - longitude (Float)
 - latitude (Float)
 - number_of_containers_at_location (Integer) - This is the number of containers being stored at a specific node

The edges.csv file has the following columns
 - first_node_id (Integer)
 - second_node_id (Integer)
 - travel_time_in_hours_between_nodes (Float)

Note: The edges are not "directed",  They represent a bidirectional connection between the two nodes

# TASK 2
Goal: Calculate and display cities that can supply containers

Once the nodes and edges are displayed on a map, the user will be able to input a city name and a length of time in hours.  You will then update the UI in two ways:
 1) You should output the number of containers that can be shipped to the selected city within the specified length of time.
 2) You should highlight on the map the cities that are able to ship containers to the selected city within the specified length of time.

# Example:
If the user inputs:
CITY: Anniston
LENGTH OF TIME IN HOURS: 2 hours

You should output:
NUMBER OF CONTAINERS THAT CAN REACH ANNISTON IN 2 HOURS: 45

And you should highlight LINDALE (node #11) on the map

# FILES INCLUDED
Inside the project directory you will see the following files:
- index.html
- mapfunctions.js (a class we created that allows you to easily manipulate a leaflet map)
- nodes.csv
- edges.csv
- imgs
  - green-icon.png
  - red-icon.png

You can make any changes you want to these files and this directory structure.  The "index.html" file and the "mapfunctions.js" file are intended to help speed things along.

# IMPORTANT NOTES
1. You can code this up in any language you want.
2. You can use any frameworks/libraries you want.  For instance, you don’t have to code an algorithm from scratch (like Dijkstras), you can just use an implementation from online.
3. You can focus on the visual aspect, you can choose to build out further functionality, etc…
