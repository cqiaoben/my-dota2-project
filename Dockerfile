From node:alpine
RUN apk add --no-cache git
RUN npm install mysql
RUN git clone https://github.com/cqiaoben/my-dota2-project.git ./cs193s
cmd node ./cs193s/libs/get_matchid.js


