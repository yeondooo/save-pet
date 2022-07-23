import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Map, MapMarker } from 'react-kakao-maps-sdk';
import FindPlaceName from './FindPlaceName';

function FindLocation({ address, setAddress, setAddressName }) {
  const [position, setPosition] = useState();
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });

  const handleClickSubmit = (event) => {
    event.preventDefault();

    setAddress(position);
    alert('위치 등록이 완료되었습니다. 지도를 닫아주세요.');
    console.log(address);
  };
  useEffect(() => {
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setState((prev) => ({
            ...prev,
            center: {
              lat: pos.coords.latitude, // 위도
              lng: pos.coords.longitude, // 경도
            },
            isLoading: false,
          }));
        },
        (err) => {
          setState((prev) => ({
            ...prev,
            errMsg: err.message,
            isLoading: false,
          }));
        },
      );
    } else {
      // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
      setState((prev) => ({
        ...prev,
        errMsg: 'geolocation을 사용할수 없어요..',
        isLoading: false,
      }));
    }
  }, []);

  return (
    <>
      <Map // 지도를 표시할 Container
        center={state.center}
        style={{
          // 지도의 크기
          width: '100%',
          height: '450px',
        }}
        level={3} // 지도의 확대 레벨
        onClick={(_t, mouseEvent) =>
          setPosition({
            lat: mouseEvent.latLng.getLat(),
            lng: mouseEvent.latLng.getLng(),
          })
        }
      >
        {position && (
          <MapMarker
            position={position}
            image={{
              src: 'https://i.ibb.co/MsqtRCN/pin.png',
              size: {
                width: 64,
                height: 69,
              },
              options: {
                offset: {
                  x: 27,
                  y: 69,
                },
              },
            }}
          />
        )}
        {!state.isLoading && (
          <MapMarker
            position={state.center}
            image={{
              src: 'https://i.ibb.co/zmQjZVT/favicon.png',
              size: {
                width: 64,
                height: 69,
              },
              options: {
                offset: {
                  x: 27,
                  y: 69,
                },
              },
            }}
          >
            <div style={{ padding: '5px', color: '#000' }}>
              {state.errMsg ? state.errMsg : '현재 위치'}
            </div>
          </MapMarker>
        )}
      </Map>

      <FindPlaceName position={position} setAddressName={setAddressName} />
      <button
        className="btn-light border-1 border-gray-200"
        type="submit"
        onClick={handleClickSubmit}
      >
        확인
      </button>
    </>
  );
}
FindLocation.propTypes = {
  address: PropTypes.string.isRequired,
  setAddress: PropTypes.string.isRequired,
  setAddressName: PropTypes.string.isRequired,
};
export default FindLocation;
