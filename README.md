## Conflict Manager Server
Application to help your team prevent potential conflicts before commit.

### Project background
*Back-end*: Node JS<br>
*Front-end*: TBD (actual native js)

#### Main technologies
- Client–Server App (Server Side)
- Sockets
- DataBase - MongoDB

#### Dependencies
- Client: https://github.com/hsplit/conflict-manager-client
- Mobile App: https://github.com/hsplit/conflict-manager-mobile-app

### Description

*Connections:*
1) client-server
2) server sockets
3) DataBase - mongoDB

*Functional:*
1) Displaying a table of potential user conflicts and in the form of the intersection of their files
2) Display the current list of currently connected users and their work files
3) Search for a file among the currently used ones and display a list of users using the file and the time of its last access
4) MongoDB
    1) Checking the file by location in the project and the day of use - displays matches and a list of users with the latest file access time
    2) Displays users and lists their files by date and period
    3) Displays a table of conflicts by date and period
    4) Search for file usage information by period

*Implemented:*
1) Server Express
2) Server Sockets (chat)
3) Logging and displaying data to the user (DataBase - MongoDB)
4) Patterns
    1) Long-poll connection - keep the connection until changes in conflicts appear, to display a table of conflicts
5) Worker - creating a worker to determine the conflicts of a specific user
