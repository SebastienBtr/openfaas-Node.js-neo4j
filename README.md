Prototype of an openfaas function in Node.js that communicate with a neo4j DB

* Start a neo4j instance and use the default movie database

* Create some review relationships:

```
MATCH (p:Person)
WITH p
MATCH (m:Movie)
WITH p, m
WHERE NOT (p)-[:WROTE|:DIRECTED|:ACTED_IN|:PRODUCED]->(m)
CREATE (p)-[:REVIEWED]->(m)
```

* Create some follow relationships:

```
MATCH (p:Person)
WITH p
MATCH (p2:Person)
WHERE NOT p.name = p2.name AND NOT (p)-[]-(p2)
LIMIT 100
CREATE (p)-[:FOLLOWS]->(p2)
```

* Edit the neo4j-prototype.yml according to your environment

* Edit the neo4j driver variable in `neo4j-prototype/handler.js` according to your neo4j instance

* Deploy the function:
`faas-cli up -f neo4j-prototype.yml`

* Test the function:
`cat test.json | faas-cli invoke -f neo4j-prototype.yml neo4j-prototype`