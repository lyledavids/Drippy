<script>
    import { onMount, onDestroy } from 'svelte';
    import { formatDistanceToNow } from 'date-fns';
    import { cancelStream, withdrawFromStream } from '../utils/contractUtils';
    import { address } from '../stores/web3Store';
  
    export let stream;
  
    let currentBalance = parseFloat(stream.remainingBalance);
    let interval;
  
    $: isRecipient = $address && $address.toLowerCase() === stream.recipient.toLowerCase();
  
    onMount(() => {
      interval = setInterval(() => {
        const now = new Date();
        if (now < stream.stopTime) {
          const elapsedSeconds = (now - stream.startTime) / 1000;
          currentBalance = parseFloat(stream.deposit) - (elapsedSeconds * parseFloat(stream.ratePerSecond));
        } else {
          currentBalance = 0;
          clearInterval(interval);
        }
      }, 1000);
    });
  
    onDestroy(() => {
      clearInterval(interval);
    });
  
    async function handleCancel() {
      try {
        await cancelStream(stream.id);
        alert('Stream cancelled successfully');
      } catch (error) {
        alert('Failed to cancel stream: ' + error.message);
      }
    }
  
    async function handleWithdraw() {
      try {
        await withdrawFromStream(stream.id, currentBalance.toString());
        alert('Withdrawn successfully');
      } catch (error) {
        alert('Failed to withdraw: ' + error.message);
      }
    }
  </script>
  
  <div class="card stream-card">
    <h3>Stream {stream.id}</h3>
    <p>Sender: {stream.sender}</p>
    <p>Recipient: {stream.recipient}</p>
    <p>Total Deposit: {stream.deposit} {stream.isNative ? 'ETH' : 'USDE'}</p>
    <p>Start Time: {formatDistanceToNow(stream.startTime, { addSuffix: true })}</p>
    <p>End Time: {formatDistanceToNow(stream.stopTime, { addSuffix: true })}</p>
    <p>Current Balance: {currentBalance.toFixed(6)} {stream.isNative ? 'ETH' : 'USDE'}</p>
    {#if isRecipient}
      <button on:click={handleWithdraw}>Withdraw</button>
    {:else}
      <button on:click={handleCancel}>Cancel Stream</button>
    {/if}
  </div>
  
  <style>
    .stream-card {
      border: 1px solid var(--primary-color);
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
    }
  
    button {
      margin-right: 0.5rem;
      margin-top: 0.5rem;
    }
  </style>
  
  