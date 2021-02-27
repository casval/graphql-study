const database = require('./database')
const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    teams: [Team]
    equipments: [Equipment]
    supplies: [Supply]
    team(id: Int): Team
  }

  type Mutation {
    deleteEquipment(id: String): Equipment
    insertEquipment(
      id: String,
      used_by: String,
      count: Int,
      new_or_used: String,
    ): Equipment
    editEquipment(
      id: String,
      used_by: String,
      count: Int,
      new_or_used: String,
    ): Equipment
  }


  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
    supplies: [Supply]
  }

  type Equipment {
    id: String
    used_by: String
    count: Int
    new_or_used: String
  }

  type Supply {
    id: String
    team: Int
  }
`

const resolvers = {
  Query: {
    teams: () => database.teams
      .map(team => {
        team.supplies = database.supplies.filter(supply => supply.team === team.id)
        return team
      }),
    equipments: () => database.equipments,
    supplies: () => database.supplies,
    team: (parent, args, context, info) => database.teams.find(team => team.id === args.id),

  },
  Mutation: {
    deleteEquipment: (parent, args, context, info) => {
      const deleted = database.equipments.find(equipment => args.id === equipment.id)
      database.equipments = database.equipments.filter(equipment => equipment.id !== args.id)
      return deleted
    },
    insertEquipment: (parent, args, context, info) => {
      database.equipments.push(args)
      return args
    },
    editEquipment: (parent, args, context, info) => {
      const e = database.equipments.find(equipment => equipment.id === args.id)
      if (e) {
        Object.assign(e, args)
      }
      return e
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
