import BigfootDB from './model/BigfootDB';

async function fetchProject (projectId) {
    const jsonPromises = ['/api/project', '/api/videos'].map(async url => {
        const response = await fetch(url);
        return response.json();
    });

    Promise.all(jsonPromises)
        .then(([project, videos]) => {
            self.project = project;
            const db = new BigfootDB(self.project.id, 1);
            return Promise.all([db.populate("matches", self.project.matches), db.populate("videos", Object.values(videos))])
        })
        .then(() => {
            self.postMessage({job: 'fetchProject', status: 'done'});
        });
}

self.onmessage = function (event) {
    const {job, payload} = event.data;
    switch (job) {
        case 'fetchProject':
            fetchProject(payload);
            break;
    }
};
