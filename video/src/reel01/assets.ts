/* Carga de recursos del reel 01 antes del primer cuadro: el caballo 3D (glTF) y las fuentes. El componente raíz no
   dibuja nada hasta que todo está listo, así ningún cuadro sale sin el caballo (ni siquiera el primero de cada pestaña). */
import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {loadHorse} from './three';

let ready = false;
export const useAssets = () => {
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender('recursos del reel (caballo 3D)', {timeoutInMilliseconds: 120000})));
  useEffect(() => {
    if (ok) return;
    loadHorse()
      .then(() => document.fonts.ready)
      .then(() => {
        ready = true;
        setOk(true);
      })
      .catch((e) => {
        console.error(e);
        setOk(true);
      });
  }, [ok]);
  useEffect(() => {
    if (ok && handle !== null) continueRender(handle);
  }, [ok, handle]);
  return ok;
};
