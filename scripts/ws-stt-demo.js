#!/usr/bin/env node

/**
 * WebSocket STT Demo Script
 * 
 * Demonstrates how to use the /ws/stt WebSocket endpoint for real-time speech-to-text.
 * 
 * Usage:
 *   node scripts/ws-stt-demo.js [audio-file.webm]
 * 
 * If no audio file is provided, it will send test data.
 */

import WebSocket from 'ws';
import { readFileSync, existsSync } from 'fs';

const WS_URL = process.env.WS_URL || 'ws://localhost:5000/ws/stt';
const AUDIO_FILE = process.argv[2];

console.log('🎙️ WebSocket STT Demo');
console.log('=====================');
console.log(`Connecting to: ${WS_URL}`);
console.log('');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('✅ Connected to STT WebSocket');
  console.log('');

  // Step 1: Configure language and MIME type
  console.log('📝 Configuring language: ru, mimeType: audio/webm');
  ws.send(JSON.stringify({
    type: 'config',
    language: 'ru',
    mimeType: 'audio/webm'
  }));

  // Step 2: Send audio data
  if (AUDIO_FILE && existsSync(AUDIO_FILE)) {
    console.log(`📤 Sending audio file: ${AUDIO_FILE}`);
    const audioBuffer = readFileSync(AUDIO_FILE);
    
    // Send in chunks (simulating streaming)
    const chunkSize = 8000; // 8KB chunks
    let offset = 0;
    
    const sendChunk = () => {
      if (offset < audioBuffer.length) {
        const chunk = audioBuffer.slice(offset, Math.min(offset + chunkSize, audioBuffer.length));
        const base64 = chunk.toString('base64');
        
        ws.send(JSON.stringify({
          type: 'audio',
          data: base64
        }));
        
        offset += chunkSize;
        console.log(`   Sent ${offset}/${audioBuffer.length} bytes (${Math.round(offset / audioBuffer.length * 100)}%)`);
        
        setTimeout(sendChunk, 500); // Send chunk every 500ms
      } else {
        console.log('✅ All audio data sent');
        console.log('');
        
        // Step 3: Finalize
        setTimeout(() => {
          console.log('🏁 Finalizing transcription...');
          ws.send(JSON.stringify({
            type: 'finalize'
          }));
        }, 1000);
      }
    };
    
    setTimeout(sendChunk, 500);
  } else {
    console.log('⚠️  No audio file provided. Sending test data instead.');
    console.log('   To test with real audio: node scripts/ws-stt-demo.js audio.webm');
    console.log('');
    
    // Send small test data
    setTimeout(() => {
      console.log('📤 Sending test audio chunk...');
      const testData = Buffer.from('test-audio-data').toString('base64');
      ws.send(JSON.stringify({
        type: 'audio',
        data: testData
      }));
      
      // Finalize after 2 seconds
      setTimeout(() => {
        console.log('🏁 Finalizing transcription...');
        ws.send(JSON.stringify({
          type: 'finalize'
        }));
      }, 2000);
    }, 500);
  }
});

ws.on('message', (data) => {
  try {
    const response = JSON.parse(data.toString());
    
    if (response.success) {
      if (response.data.connected) {
        console.log('📡 Server says:', response.data.message);
      } else if (response.data.configured) {
        console.log(`✅ Language configured: ${response.data.language}`);
      } else if (response.data.type === 'partial') {
        console.log('');
        console.log('📝 PARTIAL RESULT:');
        console.log(`   Text: "${response.data.text}"`);
        if (response.data.metrics) {
          console.log(`   Metrics:`, response.data.metrics);
        }
      } else if (response.data.type === 'final') {
        console.log('');
        console.log('✅ FINAL RESULT:');
        console.log(`   Text: "${response.data.text}"`);
        if (response.data.metrics) {
          console.log(`   Metrics:`);
          Object.entries(response.data.metrics).forEach(([key, value]) => {
            if (value !== undefined) {
              console.log(`     ${key}: ${value}ms`);
            }
          });
        }
        console.log('');
        
        // Close connection after receiving final result
        setTimeout(() => {
          console.log('👋 Closing connection...');
          ws.close();
        }, 1000);
      }
    } else {
      console.error('❌ ERROR:', response.error);
    }
  } catch (error) {
    console.error('❌ Failed to parse server message:', error.message);
  }
});

ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('👋 Connection closed');
  console.log('');
  process.exit(0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('');
  console.log('⚠️  Interrupted by user');
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  process.exit(0);
});
