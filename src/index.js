import BigfootDB from './model/BigfootDB';
import {graphql, buildSchema} from 'graphql';
import root from './model/resolvers';

console.log("hello 42!");


async function main () {
    const project = await fetch('/api/project').then(r => r.json());
    console.log(project);
    const db = new BigfootDB(project.id, 1);
    // const m = await db.populateMatches(project.matches);
    const context = {db};
    // Construct a schema, using GraphQL schema language
    const schema = await fetch('/api/schema').then(r => r.text()).then(typeDefs => buildSchema(typeDefs));
    console.log(schema);

    // Run the GraphQL query and print out the response
    graphql(schema, '{ matches{movieId} }', root, context).then((response) => {
        console.log(response);
    });

}

main();


