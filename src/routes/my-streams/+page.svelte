<script>
    import { onMount } from 'svelte';
    import { getUserStreams } from '../../lib/utils/contractUtils';
    import StreamCard from '../../lib/components/StreamCard.svelte';
    import { Jumper } from 'svelte-loading-spinners';
    import { address } from '../../lib/stores/web3Store';
  
    let streams = [];
    let loading = true;
    let error = null;
  
    async function loadStreams() {
    try {
      if ($address) {
        streams = await getUserStreams();
        console.log('Loaded streams:', streams);
      }
    } catch (err) {
      console.error('Failed to fetch streams:', err);
      error = 'Failed to load streams. Please try again.';
    } finally {
      loading = false;
    }
  }
  

  onMount(() => {
    loadStreams();
  });

  $: if ($address) {
    loadStreams();
  }

  $: incomingStreams = streams.filter(stream => stream.isIncoming);
  $: outgoingStreams = streams.filter(stream => !stream.isIncoming);

//   console.log("incoming", incomingStreams.length);
//   console.log("outgoing", outgoingStreams.length);
  </script>
  
  <h1>My Streams</h1>
  
  {#if loading}
    <div class="loading">
      <Jumper size="60" color="#3498db" unit="px" />
    </div>
  {:else if error}
    <p class="error">{error}</p>  
  {:else if !$address}
    <p>Please connect your wallet to view your streams.</p>
  {:else if streams.length === 0}
    <p>You don't have any active streams.</p>
  {:else}
    <h2>Incoming Streams</h2>
    {#if incomingStreams.length === 0}
      <p>You don't have any incoming streams.</p>
    {:else}
      {#each incomingStreams as stream (stream.id)}
        <StreamCard {stream} />
      {/each}
    {/if}
  
    <h2>Outgoing Streams</h2>
    {#if outgoingStreams.length === 0}
      <p>You don't have any outgoing streams.</p>
    {:else}
      {#each outgoingStreams as stream (stream.id)}
        <StreamCard {stream} />
      {/each}
    {/if}
  {/if}
  
  <style>
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
  
    h2 {
      margin-top: 2rem;
    }
  </style>
  
  