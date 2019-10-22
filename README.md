# Setel Petronas - Kedacom

## Requirements 
Node JS, Typescript, pm2

Node JS

* For Windows you can download the Node JS installer through this [link](https://nodejs.org/en/download/). 
* For Linux 
    ```linux_nodejs 
    $ sudo apt-get install nodejs 
    $ node -v 
    v11.6.0
    ```
Typescript 

```typescript 
npm install -g typescript 
```

pm2

```pm2 
npm install -g pm2 
``` 

## Testing 

```testingscript 
npm run start 
```

## Deploying 

```deploying 
tsc 
pm2 start dist\index.js 
```

## Trace logs via pm2 

```trace 
pm2 list 
pm2 logs <process index> 
```

## Trouble shooting mysql-events 

If the script fails to capture newly inserted database rows please ensure these [requirements](https://github.com/nevill/zongji) are met.

## Note 
Please don't change anything in the dist folder. If you need to update the code: 
make the changes in the src folder then re-transpile using the tsc command. 
