<script>
    import { onMount, onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { getStreamDetails, cancelStream, withdrawFromStream } from '../../../lib/utils/contractUtils';
    import { formatDistanceToNow, format } from 'date-fns';
    import { ethers } from 'ethers';
    import { Jumper } from 'svelte-loading-spinners';
  
    let stream = null;
    let currentBalance = 0;
    let loading = true;
    let error = null;
    let interval;
  
    $: streamId = $page.params.id;
  
    async function loadStreamDetails() {
      try {
        stream = await getStreamDetails(streamId);
        currentBalance = parseFloat(stream.remainingBalance);
        startBalanceUpdate();
      } catch (err) {
        error = 'Failed to load stream details. Please try again.';
      } finally {
        loading = false;
      }
    }
  
    function startBalanceUpdate() {
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
    }
  
    async function handleCancel() {
      try {
        await cancelStream(streamId);
        alert('Stream cancelled successfully');
        await loadStreamDetails();
      } catch (err) {
        alert('Failed to cancel stream. Please try again.');
      }
    }
  
    async function handleWithdraw() {
      try {
        const amount = ethers.utils.parseEther(currentBalance.toFixed(18));
        await withdrawFromStream(streamId, amount);
        alert('Withdrawn successfully');
        await loadStreamDetails();
      } catch (err) {
        alert('Failed to withdraw. Please try again.');
      }
    }
  
    onMount(() => {
      loadStreamDetails();
    });
  
    onDestroy(() => {
      if (interval) clearInterval(interval);
    });
  </script>
  
  <svelte:head>
    <title>Stream {streamId} | Drippy</title>
  </svelte:head>
  
  <div class="stream-details">
    <h1>Stream Details</h1>
  
    {#if loading}
      <div class="loading">
        <Jumper size="60" color="#3498db" unit="px" />
      </div>
    {:else if error}
      <p class="error">{error}</p>
    {:else if stream}
      <div class="card">
        <h2>Stream {streamId}</h2>
        <div class="grid">
          <div>
            <strong>Sender:</strong>
            <p>{stream.sender}</p>
          </div>
          <div>
            <strong>Recipient:</strong>
            <p>{stream.recipient}</p>
          </div>
          <div>
            <strong>Total Deposit:</strong>
            <p>{stream.deposit} {stream.isNative ? 'ETH' : 'USDE'}</p>
          </div>
          <div>
            <strong>Start Time:</strong>
            <p>{format(stream.startTime, 'PPpp')}</p>
            <p>({formatDistanceToNow(stream.startTime, { addSuffix: true })})</p>
          </div>
          <div>
            <strong>End Time:</strong>
            <p>{format(stream.stopTime, 'PPpp')}</p>
            <p>({formatDistanceToNow(stream.stopTime, { addSuffix: true })})</p>
          </div>
          <div>
            <strong>Rate per Second:</strong>
            <p>{parseFloat(stream.ratePerSecond).toFixed(18)} {stream.isNative ? 'ETH' : 'USDE'}</p>
          </div>
        </div>
        <div class="current-balance">
          <strong>Current Balance:</strong>
          <p>{currentBalance.toFixed(6)} {stream.isNative ? 'ETH' : 'USDE'}</p>
        </div>
        <div class="actions">
          <button on:click={handleCancel}>Cancel Stream</button>
          <button on:click={handleWithdraw}>Withdraw</button>
        </div>
      </div>
    {:else}
      <p>No stream found with ID {streamId}.</p>
    {/if}
  </div>
  
  <style>
    .stream-details {
      max-width: 800px;
      margin: 0 auto;
    }
  
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  
    .card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-top: 20px;
    }
  
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
  
    .current-balance {
      font-size: 1.2em;
      margin-bottom: 20px;
    }
  
    .actions {
      display: flex;
      gap: 10px;
    }
  
    button {
      flex: 1;
    }
  </style>