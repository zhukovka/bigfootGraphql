import BigfootDB from './model/BigfootDB';
import {graphql, buildSchema} from 'graphql';
import root from './model/resolvers';


const projectId = 'charmed20';
console.log(projectId);

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/serviceworker.js").then(function (registration) {
        console.log("Service Worker registered with scope:", registration.scope);
    }).catch(function (err) {
        console.log("Service Worker registration failed:", err);
    });
}

const worker = new Worker('worker.js');
worker.onmessage = function (e) {
    console.log('Message received from worker', event.data);

    const {job, status} = event.data;
    if (status === 'done') {
        switch (job) {
            case 'fetchProject':
                main();
                break;
        }
    }
};
worker.postMessage({job: 'fetchProject', payload: projectId});

async function main () {
    const db = new BigfootDB(projectId, 1);
    const context = {db};
    // Construct a schema, using GraphQL schema language
    const schema = await fetch('/api/schema').then(r => r.text()).then(typeDefs => buildSchema(typeDefs));
    console.log(schema);

    // Run the GraphQL query and print out the response
    graphql(schema, '{ matches{movieId} }', root, context).then((response) => {
        console.log(response);
    });

}


