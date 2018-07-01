const router = require('express').Router();
const request = require('request');

const options = {
  headers: { 'user-agent': 'node.js' },
  // auth: {
  //   user: 'daymis',
  //   key: process.env.GITHUB_API
  // }
};

module.exports = router;

router.get('/', (req, res) => {
  res.render('index.html');
});

router.get('/github', (req, res) => {
  let org = req.query.organization,
    starObj = {},
    forksObj = {},
    outsiders = {},
    insiders = {},
    sortedStars,
    sortedForks,
    outArr,
    inArr,
    sortedContributers;


  request.get(`https://api.github.com/orgs/${org}/repos`, options, (err, res, body) => {

    //going through all repos
    //access to forks and stars 
    //dont have access to contributers
    let bodyObj = JSON.parse(body);
    console.log(`TYPEOF: ${typeof bodyObj}, is ARRAY? ${Array.isArray(bodyObj)}`);

    // console.log('statusCode:', res && res.statusCode);
    // console.log(`body: `, body);

    // console.log(bodyObj);
    if (Array.isArray(bodyObj)) {
      sortedStars = bodyObj.sort((a, b) => b.stargazers_count - a.stargazers_count);
      sortedForks = bodyObj.sort((a, b) => b.forks_count - a.forks_count);
    }

    Array.isArray(bodyObj) && bodyObj.forEach((elem, idx) => {
      let contribCount = 0,
        repoName = elem.name;

      //descending sort for each

      request.get(`https://api.github.com/orgs/${org}/${repoName}/collaborators?affiliation=outside`, options, (err, res, ibody) => {
        //outsiders
        let collabObj = Object.entries(JSON.parse(ibody));

        console.log(`TYPEOF: ${typeof collabObj}, is ARRAY? ${Array.isArray(collabObj)}`);

        Array.isArray(collabObj) && collabObj.forEach(collaberator => {
          let userId = collaberator.login;

          contribCount++;

          if (outsiders[userId]) outsiders[userId]++;
          else outsiders.userId = 1;
        });
      });

      request.get(`https://api.github.com/orgs/${org}/${repoName}/collaborators?affiliation=direct`, options, (err, res, dbody) => {
        let collabObj = JSON.parse(dbody);

        collabObj.forEach(collaberator => {
          let userId = collaberator.login;

          contribCount++;

          if (insiders[userId]) insiders[userId]++;
          else insiders.userId = 1;
        });
      });

      outArr = Object.entries(outsiders).sort((a, b) => b[1] - a[1]);
      inArr = Object.entries(insiders).sort((a, b) => b[1] - a[1]);

      elem['numContribs'] = contribCount;

    });
    // console.log(bodyObj[0]);

    // let sortedStars = bodyObj.sort((repo1, repo2) => repo1[stargazers_count] - repo2[stargazers_count]);
    // console.log(sortedStars)
    // console.log()

    sortedContributers = bodyObj.sort((a, b) => b.numContribs - a.numContribs);
  });


  res.render('index', {
    org,
    topStars: sortedStars.slice(0, 5),
    topForks: sortedForks.slice(0, 5),
    topContribs: sortedContributers.slice(0, 5),
    topOutsiders: outArr.slice(0, 5),
    topInsiders: inArr.slice(0, 5)
  });
  // console.log(org);
  // res.send(org);
});