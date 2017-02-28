From node:alpine
RUN apk add --no-cache git
RUN npm install -g mysql
RUN git clone https://github.com/cqiaoben/my-dota2-project.git ./cs193s
cmd node ./cs193s/lib/get_matchid.js


