<script>
    import { address } from '../lib/stores/web3Store';
  </script>
  
  <h1>Welcome to Drippy</h1>
  
  {#if $address}
    <p>You are connected with address: {$address}</p>
    <p>Start creating or managing your token streams!</p>
    <a href="/create-stream"><button>Create New Stream</button></a>
    <a href="/my-streams"><button>View My Streams</button></a>
  {:else}
    <p>Please connect your wallet to use Drippy.</p>
  {/if}