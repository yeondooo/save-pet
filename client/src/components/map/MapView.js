/* eslint-disable no-underscore-dangle */

import { React, useEffect, useState } from 'react';
import { Map, MapMarker, useMap } from 'react-kakao-maps-sdk';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SpinningCircles } from 'react-loading-icons';
import PropTypes from 'prop-types';
import Map2ListToggle from './Map2ListToggle';

function InfoWindowContent({ data }) {
  const { happenDate } = data;
  // 몇일 전 발견인지 계산
  const latestDate = new Date(
    `${happenDate.substring(0, 4)}-${happenDate.substring(
      4,
      6,
    )}-${happenDate.substring(6)}`,
  );
  const today = new Date();
  const diffDate = Math.abs(
    Math.ceil((latestDate.getTime() - today.getTime()) / (1000 * 3600 * 24)),
  );

  return (
    <div className="px-[20px] py-[15px] w-[220px] text-left">
      <div className="text-black">
        <span className="notranslate">
          <ul>
            <img
              src={data.imgUrl}
              className="w-[200px]"
              alt="latest update in this shelter"
            />
            <li className="text-xs text-gray-400">
              이 위치에서 {diffDate}일 전 발견
            </li>
            <li className="text-sm">{data.careName}에서 보호 중</li>
          </ul>
        </span>
      </div>
    </div>
  );
}

function getInfoWindowData(data) {
  return data.map((obj) => ({
    content: <InfoWindowContent data={obj} />,
    latlng: { lat: obj.happenLatitude, lng: obj.happenLongitude },
    id: obj._id,
  }));
}

function EventMarkerContainer({ position, content, id }) {
  const map = useMap();
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  return (
    <MapMarker
      position={position}
      onClick={(marker) => {
        map.panTo(marker.getPosition());
        navigate(`/rescue/${id}`);
      }}
      onMouseOver={() => setIsVisible(true)}
      onMouseOut={() => setIsVisible(false)}
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
    >
      {isVisible && content}
    </MapMarker>
  );
}

function MapView() {
  const [makeRescueList, setMakeRescueList] = useState([]);
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getRescueData = async () => {
    setIsLoading(true);
    await axios({
      url: `${process.env.REACT_APP_SERVER_DOMAIN}/api/rescue`,
      method: 'GET',
    }).then((res) => {
      setMakeRescueList(res.data);
      setIsLoading(false);
    });
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude, // 위도
              lng: position.coords.longitude, // 경도
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
  };

  useEffect(() => {
    const asyncGetData = async () => {
      await getRescueData();
    };
    findMyLocation();
    asyncGetData().then();
  }, []);

  const rescueList = getInfoWindowData(makeRescueList);
  if (isLoading)
    return (
      <div className="flex justify-center items-center	 w-100 h-screen">
        <SpinningCircles fill="#EDA900" stroke="#997000" />
      </div>
    );
  return (
    <div id="map_wrap" className="relative w-full h-96 m-0 p-0">
      <div id="map" className="relative w-full h-full">
        <p className="mx-2 my-1 text-sm text-gray-400">
          *핀 위에 마우스를 올리면 해당 위치에서 구조된 동물을 볼 수 있으며,
          핀을 클릭하면 구조 동물 상세로 이동합니다.
          <br />
          **현재 버전은 배포 상 보안의 문제로 지도에서 현재 위치를 사용할 수
          없습니다. 기본 위치는 제주도이니 스크롤 및 줌인/줌아웃으로 지도를
          움직여 주세요.
        </p>
        <div className="relative">
          <div className="h-12 z-10 absolute top-[3vh] mx-auto inset-x-0 text-center opacity-80">
            <Map2ListToggle />
          </div>

          <Map // 지도를 표시할 Container
            center={state.center}
            className="w-full h-[77vh]"
            level={3} // 지도의 확대 레벨
          >
            {!state.isLoading && (
              <MapMarker position={state.center}>
                <div className="p-[5px] text-black">
                  {state.errMsg ? state.errMsg : '현재 위치'}
                </div>
              </MapMarker>
            )}
            {rescueList.map((rescue) => (
              <div key={rescueList.desertionNo}>
                <EventMarkerContainer
                  key={`EventMarkerContainer-${rescue.latlng.lat}-${rescue.latlng.lng}`}
                  position={rescue.latlng}
                  content={rescue.content}
                  id={rescue.id}
                />
              </div>
            ))}
          </Map>
        </div>
      </div>
      <div
        id="menu_wrap"
        className="absolute w-64 h-[78vh] top-10 left-0 bottom-0 mt-0 mr-0 mb-30 ml-30 p-5 overflow-y-auto z-10 bg-white text-center"
      >
        <ul id="placesList">
          <li className="relative border-b-2 cursor-pointer min-h-65">
            <span className="block mt-4" />
            <div className="pt-10 pr-0 pb-10 pl-55">
              <h5 className="">places.place_name</h5>
              <span>places.road_address_name </span>
              <span className="jibun gray">places.address_name </span>
              <span> places.address_name </span>
              <span className="tel"> places.phone </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default MapView;

InfoWindowContent.propTypes = {
  data: PropTypes.shape().isRequired,
};
EventMarkerContainer.propTypes = {
  position: PropTypes.shape().isRequired,
  content: PropTypes.element.isRequired,
  id: PropTypes.number.isRequired,
};
