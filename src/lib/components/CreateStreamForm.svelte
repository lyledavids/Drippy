<script>
    import { createStream } from '../utils/contractUtils';
    import { ethers } from 'ethers';
  
    let recipient = '';
    let deposit = '';
    let duration = '';
    let timeUnit = 'seconds';
    let isNative = true;
    let error = '';
    let loading = false;
  
    const timeUnits = [
      { value: 'seconds', label: 'Seconds' },
      { value: 'minutes', label: 'Minutes' },
      { value: 'hours', label: 'Hours' },
      { value: 'days', label: 'Days' }
    ];
  
    function convertToSeconds(value, unit) {
      const multipliers = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86400
      };
      return Math.floor(parseFloat(value) * multipliers[unit]);
    }
  
    async function handleSubmit() {
      error = '';
      loading = true;
      try {
        if (!ethers.utils.isAddress(recipient)) {
          throw new Error('Invalid recipient address');
        }
        if (isNaN(deposit) || parseFloat(deposit) <= 0) {
          throw new Error('Invalid deposit amount');
        }
        if (isNaN(duration) || parseFloat(duration) <= 0) {
          throw new Error('Invalid duration');
        }
  
        const durationInSeconds = convertToSeconds(duration, timeUnit);
        const txHash = await createStream(recipient, deposit, durationInSeconds, isNative);
        alert(`Stream created successfully. Transaction hash: ${txHash}`);
        recipient = '';
        deposit = '';
        duration = '';
      } catch (err) {
        console.error('Error creating stream:', err);
        error = err.message || 'Failed to create stream. Please try again.';
      } finally {
        loading = false;
      }
    }
  </script>
  
  <form on:submit|preventDefault={handleSubmit} class="card">
    <h2>Create New Stream</h2>
    <label>
      Recipient Address:
      <input type="text" bind:value={recipient} required />
    </label>
    <label>
      Deposit Amount:
      <input type="number" bind:value={deposit} required min="0" step="0.000001" />
    </label>
    <label>
      Duration:
      <div class="duration-input">
        <input type="number" bind:value={duration} required min="1" />
        <select bind:value={timeUnit}>
          {#each timeUnits as unit}
            <option value={unit.value}>{unit.label}</option>
          {/each}
        </select>
      </div>
    </label>
    <label>
      Token Type:
      <select bind:value={isNative}>
        <option value={true}>Native (cBTC)</option>
        <option value={false}>cUSDC</option>
      </select>
    </label>
    <button type="submit" disabled={loading}>
      {loading ? 'Creating Stream...' : 'Create Stream'}
    </button>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
  
  <style>
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    label {
      display: flex;
      flex-direction: column;
    }
  
    .duration-input {
      display: flex;
      gap: 0.5rem;
    }
  
    .duration-input input {
      flex: 1;
    }
  
    .duration-input select {
      width: auto;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  </style>
  
  