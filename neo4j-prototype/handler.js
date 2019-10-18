const neo4j = require('neo4j-driver').v1

module.exports = async (context, callback) => {
    const driver = neo4j.driver(
        'bolt://54.236.16.222:33028', // URL of your neo4j instance
        neo4j.auth.basic('neo4j', 'traffic-remedy-filter') // login and password of your neo4j instance
    );

    // Get all movies which have been reviewed by people the actor follows, 
    // directed by someone born after a certain year, and the actor didn't write, direct, produce or act in
    const session = driver.session();
    try {
        const body = JSON.parse(context);
        const { actor } = body;
        const { born } = body;
        if (actor && born) {
            session.run(`
                MATCH(p: Person) - [: FOLLOWS] - > (Person) - [: REVIEWED] - > (m: Movie) < -[: DIRECTED] - (p2: Person)
                WHERE p.name = $name
                AND p2.born > $year AND NOT(p) - [: WROTE |: DIRECTED |: ACTED_IN |: PRODUCED] - (m)
                RETURN DISTINCT m.title`,
                {
                    name: actor,
                    year: born
                }
            ).then((result) => {
                const records = [];
                result.records.forEach((record) => {
                    records.push(record.get('m.title'));
                });
                callback(undefined, records);
                session.close();
                driver.close();
            }).catch((err) => {
                callback(err);
                session.close();
                driver.close();
            })
        } else {
            callback('wrong body');
            session.close();
            driver.close();
        }
    } catch (err) {
        callback(err);
        session.close();
        driver.close();
    }
}
