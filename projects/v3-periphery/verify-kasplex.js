const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Kasplex Testnet Contract Verification Script
 * This script attempts to verify contracts directly via the explorer API
 */

const CONFIG = {
  contractAddress: '0xD7872B6852aaC662d1343426C3c2ce5Cb1Dc5974',
  contractName: 'NonfungiblePositionManager',
  compilerVersion: '0.7.6',
  optimizationEnabled: true,
  optimizationRuns: 1000000,
  explorerApiUrl: 'https://explorer.testnet.kasplextest.xyz/api',
  apiKey: 'MNNUYHJNPKZN5BIGCC4K8IH9PA9TB68G5J',
  constructorArgs: '0x000000000000000000000000118da2e86a8935cc8ee05f7844e11173fdf058f1000000000000000000000000b365456e94f3d53661d537a62b06d41aeab50eb4000000000000000000000000d18fcd278f7156daa2a506dbc2a4a15337b91b94000000000000000000000000d9ed9d69c5263d0c82ea63250efe916c85ec313d',
  sourceCodeFile: 'NFTManagerFlatten.sol'
};

async function verifyContract() {
  console.log('=== Kasplex Testnet Contract Verification ===');
  console.log(`Contract Address: ${CONFIG.contractAddress}`);
  console.log(`Contract Name: ${CONFIG.contractName}`);
  console.log('');

  try {
    // Step 1: Read the flattened source code
    const sourceCodePath = path.join(__dirname, CONFIG.sourceCodeFile);
    if (!fs.existsSync(sourceCodePath)) {
      throw new Error(`Source code file not found: ${CONFIG.sourceCodeFile}`);
    }

    const sourceCode = fs.readFileSync(sourceCodePath, 'utf8');
    console.log('✅ Source code loaded successfully');

    // Step 2: Prepare verification request
    const verificationData = {
      apikey: CONFIG.apiKey,
      module: 'contract',
      action: 'verifysourcecode',
      contractaddress: CONFIG.contractAddress,
      sourceCode: sourceCode,
      contractname: CONFIG.contractName,
      compilerversion: `v${CONFIG.compilerVersion}+commit.7338295f`,
      optimizationUsed: CONFIG.optimizationEnabled ? '1' : '0',
      runs: CONFIG.optimizationRuns.toString(),
      constructorArguements: CONFIG.constructorArgs
    };

    console.log('📤 Submitting verification request...');

    // Step 3: Submit verification request
    try {
      const response = await axios.post(CONFIG.explorerApiUrl, verificationData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      });

      console.log('📥 Response received:');
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.status === '1') {
        console.log('✅ Verification request submitted successfully!');
        console.log(`GUID: ${response.data.result}`);
        
        // Step 4: Check verification status
        await checkVerificationStatus(response.data.result);
      } else {
        console.log('❌ Verification request failed:');
        console.log(response.data.result);
      }

    } catch (apiError) {
      console.log('⚠️ API verification failed, this might be expected for new chains');
      console.log('Error:', apiError.message);
      
      // Provide manual verification instructions
      console.log('');
      console.log('=== Manual Verification Instructions ===');
      console.log('1. Visit: https://explorer.testnet.kasplextest.xyz');
      console.log(`2. Search for contract: ${CONFIG.contractAddress}`);
      console.log('3. Click "Verify & Publish" on the contract page');
      console.log('4. Use these settings:');
      console.log(`   - Compiler Version: v${CONFIG.compilerVersion}+commit.7338295f`);
      console.log(`   - Optimization: ${CONFIG.optimizationEnabled ? 'Yes' : 'No'}`);
      console.log(`   - Runs: ${CONFIG.optimizationRuns}`);
      console.log(`   - Constructor Arguments: ${CONFIG.constructorArgs}`);
      console.log(`   - Source Code: Upload ${CONFIG.sourceCodeFile}`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

async function checkVerificationStatus(guid) {
  console.log('🔄 Checking verification status...');
  
  const maxAttempts = 10;
  const delay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const statusResponse = await axios.get(CONFIG.explorerApiUrl, {
        params: {
          apikey: CONFIG.apiKey,
          module: 'contract',
          action: 'checkverifystatus',
          guid: guid
        },
        timeout: 10000
      });

      console.log(`Attempt ${attempt}: ${statusResponse.data.result}`);

      if (statusResponse.data.status === '1') {
        if (statusResponse.data.result === 'Success') {
          console.log('🎉 Contract verification completed successfully!');
          console.log(`View verified contract: https://explorer.testnet.kasplextest.xyz/address/${CONFIG.contractAddress}`);
          return;
        } else if (statusResponse.data.result.includes('Fail')) {
          console.log('❌ Contract verification failed:', statusResponse.data.result);
          return;
        }
      }

      if (attempt < maxAttempts) {
        console.log(`⏳ Waiting ${delay/1000} seconds before next check...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.log(`❌ Status check attempt ${attempt} failed:`, error.message);
    }
  }

  console.log('⚠️ Verification status check timed out. Please check manually on the explorer.');
}

// Constructor parameters for reference
console.log('=== Constructor Parameters ===');
console.log('deployer (poolDeployer): 0x118dA2E86a8935cc8ee05f7844E11173fdF058F1');
console.log('factory: 0xb365456e94F3d53661d537a62b06d41AEAb50EB4');
console.log('WETH9 (WKAS): 0xD18FCd278F7156DaA2a506dBC2A4a15337B91b94');
console.log('tokenDescriptor: 0xD9ed9d69c5263D0C82Ea63250Efe916c85ec313d');
console.log('');

// Run the verification
verifyContract().catch(console.error);
