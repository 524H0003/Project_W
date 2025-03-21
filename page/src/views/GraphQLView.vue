<template>
  <div class="h-dvh" id="target" />
</template>

<script setup lang="ts">
import { ApolloExplorer } from '@apollo/explorer';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(async () => {
  const { data } = (await (
    await fetch(route.path, {
      method: 'POST',
      body: JSON.stringify({
        query:
          'query IntrospectionQuery {\n__schema {\nqueryType {\nname\n}\nmutationType {\nname\n}\nsubscriptionType {\nname\n}\ntypes {\n...FullType\n}\ndirectives {\nname\ndescription\nlocations\nargs {\n...InputValue\n}\n}\n}\n}\n\nfragment FullType on __Type {\nkind\nname\ndescription\nfields(includeDeprecated: true) {\nname\ndescription\nargs {\n...InputValue\n}\ntype {\n...TypeRef\n}\nisDeprecated\ndeprecationReason\n}\ninputFields {\n...InputValue\n}\ninterfaces {\n...TypeRef\n}\nenumValues(includeDeprecated: true) {\nname\ndescription\nisDeprecated\ndeprecationReason\n}\npossibleTypes {\n...TypeRef\n}\n}\n\nfragment InputValue on __InputValue {\nname\ndescription\ntype {\n...TypeRef\n}\ndefaultValue\n}\n\nfragment TypeRef on __Type {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\nofType {\nkind\nname\n}\n}\n}\n}\n}\n}\n}\n}\n',
      }),
      headers: { 'content-type': 'application/json' },
    })
  ).json()) || { data: '' };

  new ApolloExplorer({
    target: '#target',
    schema: data,
    endpointUrl: route.path,
    persistExplorerState: true,
    includeCookies: true,
    handleRequest: async (
      endpointUrl: string,
      options: Omit<RequestInit, 'headers'> & {
        headers: Record<string, string>;
      },
    ): Promise<Response> => {
      const { token } = (await (
        await fetch(route.path + '/csrf-token', {
          method: 'GET',
        })
      ).json()) || { token: '' };

      options.headers['csrf-token'] = token;

      return fetch(endpointUrl, { ...options, credentials: 'same-origin' });
    },
    initialState: {
      document: '',
      variables: {},
      headers: {},
      displayOptions: {
        showHeadersAndEnvVars: true,
        docsPanelState: 'open',
      },
    },
  });
});
</script>
