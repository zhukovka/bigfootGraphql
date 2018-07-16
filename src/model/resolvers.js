// The root provides a resolver function for each API endpoint
const root = {
    matches: (args, context, info) => {
        return context.db.collection('matches');
    }
};

export default root;