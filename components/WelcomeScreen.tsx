import React, { useEffect, useRef } from 'react';
import { textToSpeech } from '../services/geminiService';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    let isPlaying = false;

    const playWelcomeMessage = async () => {
        if (isPlaying) return;
        isPlaying = true;

        try {
            const welcomeText = "Selamat datang di aplikasi generator administrasi guru dan bank soal adaptif Yayasan Pendidikan Islam Pondok Modern Al-Ghozali";
            const audioBuffer = await textToSpeech(welcomeText);
            
            if (audioSourceRef.current) audioSourceRef.current.stop();
            if (audioContextRef.current) audioContextRef.current.close();

            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start();

            audioContextRef.current = context;
            audioSourceRef.current = source;

            source.onended = () => {
                context.close();
                audioContextRef.current = null;
                audioSourceRef.current = null;
            };

        } catch (error: any) {
            const errorMessage = error.toString();
            if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                console.warn("TTS quota for welcome audio exceeded. The audio will not be played.");
            } else {
                console.error("Gagal memutar audio sambutan:", error);
            }
        }
    };

    playWelcomeMessage();

    return () => {
        if (audioSourceRef.current) audioSourceRef.current.stop();
        if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-start p-4 py-12 text-white text-center fade-in overflow-y-auto">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-bold text-yellow-400 mb-4">
          Selamat Datang di Platform AI Guru Inovatif
        </h1>
        <p className="text-2xl font-semibold text-gray-200 mb-8">
          YPI Pondok Modern Al-Ghozali
        </p>
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          Revolusikan cara Anda mengajar dengan asisten cerdas yang dirancang untuk Kurikulum Merdeka. Buat perangkat ajar, bank soal adaptif, dan materi pembelajaran berkualitas tinggi dalam hitungan menit, bukan jam.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-xl mb-2">Administrasi Cerdas</h3>
            <p className="text-gray-400">Generate ATP, Prota, Promes, hingga Modul Ajar lengkap secara otomatis.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="font-bold text-xl mb-2">Bank Soal Adaptif</h3>
            <p className="text-gray-400">Buat paket asesmen, kisi-kisi, dan analisis soal HOTS dengan mudah.</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="bg-yellow-500 text-gray-900 font-bold py-4 px-10 rounded-full text-xl hover:bg-yellow-400 transition-transform transform hover:scale-105 shadow-lg"
        >
          Mulai Sekarang
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
