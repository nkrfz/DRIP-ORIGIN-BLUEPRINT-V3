'use client';
import {useEffect,useRef} from 'react';
import ParticleExperience from './ParticleExperience';
export default function InteriorStage({shape=0}:{shape?:number}){const progress=useRef(shape);useEffect(()=>{progress.current=shape;},[shape]);return <div className="interior-particles"><ParticleExperience progressRef={progress} small/></div>;}
