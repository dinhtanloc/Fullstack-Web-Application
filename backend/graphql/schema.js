import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Blog {
    id: ID!
    title: String!
    content: String!
    author: User
  }

  type Query {
    users: [User]
    blogs: [Blog]
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): User
    login(email: String!, password: String!): String
    createBlog(title: String!, content: String!): Blog
  }
`;

export default typeDefs;
