import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Event = {
  __typename?: 'Event';
  additionalFields: Scalars['JSON']['output'];
  applicationDeadline: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  endDate: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  location: Scalars['String']['output'];
  maxParticipants: Scalars['Float']['output'];
  positionsAvailable: Scalars['Float']['output'];
  requiredSkills: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  status: Event_Status;
  title: Scalars['String']['output'];
  type: Event_Type;
};

export type EventAssign = {
  additionalFields?: InputMaybe<Scalars['JSON']['input']>;
  applicationDeadline: Scalars['DateTime']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endDate: Scalars['DateTime']['input'];
  location: Scalars['String']['input'];
  maxParticipants: Scalars['Float']['input'];
  positionsAvailable: Scalars['Float']['input'];
  requiredSkills?: InputMaybe<Scalars['String']['input']>;
  startDate: Scalars['DateTime']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  type?: InputMaybe<Scalars['String']['input']>;
};

export type EventUpdate = {
  additionalFields?: InputMaybe<Scalars['JSON']['input']>;
  applicationDeadline?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  location?: InputMaybe<Scalars['String']['input']>;
  maxParticipants?: InputMaybe<Scalars['Float']['input']>;
  positionsAvailable?: InputMaybe<Scalars['Float']['input']>;
  requiredSkills?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  assignEvent: Event;
  updateEvent: Event;
};


export type MutationAssignEventArgs = {
  input: EventAssign;
};


export type MutationUpdateEventArgs = {
  input: EventUpdate;
};

export type Query = {
  __typename?: 'Query';
  user: User;
  userAll: Array<User>;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  role: UserRole;
};

export enum UserRole {
  Admin = 'admin',
  Enterprise = 'enterprise',
  Faculty = 'faculty',
  Student = 'student',
  Undefined = 'undefined'
}

export enum Event_Status {
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  Draft = 'Draft',
  Published = 'Published'
}

export enum Event_Type {
  Internship = 'Internship',
  JobFair = 'Job_fair',
  Seminar = 'Seminar',
  Workshop = 'Workshop'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Event: ResolverTypeWrapper<Event>;
  EventAssign: EventAssign;
  EventUpdate: EventUpdate;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  User: ResolverTypeWrapper<User>;
  UserRole: UserRole;
  event_status: Event_Status;
  event_type: Event_Type;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Event: Event;
  EventAssign: EventAssign;
  EventUpdate: EventUpdate;
  Float: Scalars['Float']['output'];
  JSON: Scalars['JSON']['output'];
  Mutation: {};
  Query: {};
  String: Scalars['String']['output'];
  User: User;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type EventResolvers<ContextType = any, ParentType extends ResolversParentTypes['Event'] = ResolversParentTypes['Event']> = {
  additionalFields?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
  applicationDeadline?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  maxParticipants?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  positionsAvailable?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  requiredSkills?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['event_status'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['event_type'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  assignEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationAssignEventArgs, 'input'>>;
  updateEvent?: Resolver<ResolversTypes['Event'], ParentType, ContextType, RequireFields<MutationUpdateEventArgs, 'input'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
  userAll?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  role?: Resolver<ResolversTypes['UserRole'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  DateTime?: GraphQLScalarType;
  Event?: EventResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
};


export type AssignEventMutationVariables = Exact<{
  input: EventAssign;
}>;


export type AssignEventMutation = { __typename?: 'Mutation', assignEvent: { __typename?: 'Event', additionalFields: any, applicationDeadline: any, description: string, endDate: any, id: string, location: string, maxParticipants: number, positionsAvailable: number, requiredSkills: string, startDate: any, status: Event_Status, title: string, type: Event_Type } };

export type UpdateEventMutationVariables = Exact<{
  input: EventUpdate;
}>;


export type UpdateEventMutation = { __typename?: 'Mutation', updateEvent: { __typename?: 'Event', additionalFields: any, applicationDeadline: any, description: string, endDate: any, id: string, location: string, maxParticipants: number, positionsAvailable: number, requiredSkills: string, startDate: any, status: Event_Status, title: string, type: Event_Type } };

export type UserQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', role: UserRole } };

export type UserAllQueryVariables = Exact<{ [key: string]: never; }>;


export type UserAllQuery = { __typename?: 'Query', userAll: Array<{ __typename?: 'User', role: UserRole }> };


export const AssignEvent = gql`
    mutation assignEvent($input: EventAssign!) {
  assignEvent(input: $input) {
    additionalFields
    applicationDeadline
    description
    endDate
    id
    location
    maxParticipants
    positionsAvailable
    requiredSkills
    startDate
    status
    title
    type
  }
}
    `;
export const UpdateEvent = gql`
    mutation updateEvent($input: EventUpdate!) {
  updateEvent(input: $input) {
    additionalFields
    applicationDeadline
    description
    endDate
    id
    location
    maxParticipants
    positionsAvailable
    requiredSkills
    startDate
    status
    title
    type
  }
}
    `;
export const User = gql`
    query user($id: String!) {
  user(id: $id) {
    role
  }
}
    `;
export const UserAll = gql`
    query userAll {
  userAll {
    role
  }
}
    `;