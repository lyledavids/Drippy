<script>
    import { onMount } from 'svelte';
    import { address, connectWallet } from '../stores/web3Store';
    // import { getBalances } from '../utils/contractUtils';
  
    //let ethBalance = '0';
    let usdeBalance = '0';
  
    // async function updateBalances() {
    //   if ($address) {
    //     try {
    //       const balances = await getBalances();
    //       //ethBalance = parseFloat(balances.eth).toFixed(4);
    //       usdeBalance = parseFloat(balances.usde).toFixed(2);
    //     } catch (error) {
    //       console.error('Error updating balances:', error);
    //     }
    //   }
    // }
  
    // onMount(() => {
    //   updateBalances();
    // });
  
    // $: if ($address) {
    //   updateBalances();
    // }
  </script>
  
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/create-stream">Create Stream</a></li>
        <li><a href="/my-streams">My Streams</a></li>
      </ul>
    </nav>
    <div class="wallet-info">
      {#if $address}
        <p>Connected: {$address.slice(0, 6)}...{$address.slice(-4)}</p>
        <!-- <p>ETH: {ethBalance}</p> -->
        <!-- <p>USDE: {usdeBalance}</p> -->
      {:else}
        <button on:click={connectWallet}>Connect Wallet</button>
      {/if}
    </div>
  </header>
  
  <style>
    header {
      background-color: var(--primary-color);
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    nav ul {
      list-style-type: none;
      padding: 0;
      display: flex;
      gap: 1rem;
    }
  
    nav a {
      color: white;
      text-decoration: none;
    }
  
    .wallet-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
  
    button {
      background-color: white;
      color: var(--primary-color);
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  
  