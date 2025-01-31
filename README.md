# LearnLink
Our app is called LearnLink. This app is to match student with other students
to create study groups for their course. The app will allow the user to create a login page. 
If the user already has a login page then they can just sign in.
Users can message eachother, create a profile and match with other users for what requirements they want with their study group. 
Users can use the resources and have a personal grade calculator as well.

# Website Link
https://main.d37jjc6afovpjz.amplifyapp.com


## External Requirements

In order to build this project you first have to install:

-   [Node.js](https://nodejs.org/en/)
-   [React](https://github.com/facebook/create-react-app)

If possible, list the actual commands you used to install these, so the reader
can just cut-n-paste the commands and get everything setup.

You only need to add instructions for the OS you are using.

## Setup


Here you list all the one-time things the developer needs to do after cloning
your repo. Sometimes there is no need for this section, but some apps require
some first-time configuration from the developer, for example: setting up a
database for running your webapp locally.

Navigate to the server directory and enter these commands in the command line of the terminal
```
npm i
```

Navigate to the ui directory and enter these commands in the command line of the terminal
```
npm i
```

## Running

npm start

# Deployment

### **Frontend Deployment**
1. **Setup Frontend Code**  
   - The frontend application is located in the `learnlink-ui` folder.  
   - It was built using React and configured for deployment through AWS Amplify.

2. **Deploy via AWS Amplify**  
   - Connected the frontend repository to AWS Amplify.  
   - Configured Amplify to automatically build and deploy the application on updates.  
   - The frontend is accessible at the Amplify-provided URL [here](https://main.d37jjc6afovpjz.amplifyapp.com).


### **Backend Deployment**
1. **Containerization**  
   - The backend application, located in the `learnlink-server` folder, was containerized using Docker.  
   - A `Dockerfile` was created to define the container's environment and dependencies.  
   - The backend listens on port `443` for HTTPS traffic.

2. **Hosting on AWS EC2**  
   - Deployed the Docker container to an AWS EC2 instance.  
   - Ensured required ports (80 and 443) were opened in the EC2 security group.  
   - Used Let's Encrypt to generate SSL certificates for secure HTTPS connections.

3. **Domain Name Configuration**  
   - Registered the domain name `https://learnlinkserverhost.zapto.org` via [No-IP](https://www.noip.com).  
   - Configured the domain to point to the EC2 instance's public IP address.  
   - Integrated the SSL certificates into the backend to ensure secure API calls.

4. **Redirect from HTTP to HTTPS**  
   - Configured the backend to redirect all HTTP traffic to HTTPS for security.


### **Integration**  
- The frontend communicates with the backend via the custom domain `https://learnlinkserverhost.zapto.org`.  
- API calls are routed securely using HTTPS.

# Testing

## UI Tests
The unit tests are in `learnlink-ui/src/__tests__/unit`.

The behavioral tests are in `learnlink-ui/src/__tests__/behavioral`.

## Testing Technology

In some cases you need to install test runners, etc. Explain how.

## Running Tests

### Testing UI
Navigate to `learnlink-ui`
run `npm test`

# Authors

Natalie Crawford - natcrawfordd@gmail.com, crawfon@email.sc.edu \
Kennedy Houston - kenbhx@gmail.com, kbh5@email.sc.edu \
Yesha Patel - yeshapatel143@icloud.com, yppatel@email.sc.edu \
Kelly Finnegan - kellfin9946@gmail.com, finnegak@email.sc.edu \
Sara (Rae) Jones - sej15@email.sc.edu
