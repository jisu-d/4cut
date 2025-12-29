import type {ImgPlaceData} from '../../../types/types';
import img202505041205234 from "../../../assets/Icon/Mypage/test_img.png";
import test_img from "../../../assets/test/all_test.png"

import saesol4cut from "../../../assets/frame/saesol4cut.png"
import saesol4cutPreview from "../../../assets/frame/preview/saesol4cut.png"

// '1':[
//     {ratio: '16:9', left: 113, top: 120, width: 1908, height: 1073, angle: 0, imgSrc: null, gifBlob: null},
//     {ratio: '4:3', left: 1652, top: 1354, width: 1543, height: 1158, angle: 0, imgSrc: null, gifBlob: null},
//     {ratio: '3:4', left: 151, top: 2447, width: 1391, height: 1619, angle: 0, imgSrc: null, gifBlob: null},
//     {ratio: '1:1', left: 1771, top: 3299, width: 1322, height: 1322, angle: 0, imgSrc: null, gifBlob: null},
// ],

// '1': [
//     {ratio: '4:3', left: 175, top: 922, width: 1874, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
//     {ratio: '4:3', left: 1755, top: 162, width: 1874, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
//     {ratio: '4:3', left: 175, top: 2865, width: 1874, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
//     {ratio: '4:3', left: 1754, top: 2098, width: 1874, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
// ],

export const frameData: Record<string, ImgPlaceData[]> = {
    '1': [
        {ratio: '4:3', left: 1740, top: 145, width: 1879, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
        {ratio: '4:3', left: 1739, top: 2081, width: 1879, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
        {ratio: '4:3', left: 160, top: 905, width: 1879, height: 1404, angle: 90, imgSrc: null, gifBlob: null},
        {ratio: '4:3', left: 160, top: 2848, width: 1879, height: 1404, angle: 90, imgSrc: null, gifBlob: null},

    ],
    '3': [
        {ratio: '16:9', left: 113, top: 120, width: 1908, height: 1073, angle: 0, imgSrc: null, gifBlob: null},
        {ratio: '4:3', left: 1652, top: 1354, width: 1543, height: 1158, angle: 0, imgSrc: null, gifBlob: null},
        {ratio: '3:4', left: 151, top: 2447, width: 1391, height: 1619, angle: 0, imgSrc: null, gifBlob: null},
        {ratio: '1:1', left: 1771, top: 3299, width: 1322, height: 1322, angle: 0, imgSrc: null, gifBlob: null},
    ]
}

export const frameMeta: Record<string, { orientation: 'landscape' | 'portrait' }> = {
    '1': { orientation: 'landscape' },
    '3': { orientation: 'portrait' }
};

export const artworks = [
    {
        id: 1,
        title: "새솔 네컷",
        previewUrl: saesol4cutPreview,
        frameUrl: saesol4cut,
        viewCount: "1.7K",
        likeCount: "234",
        createdDate: "2024.12.15",
    },
    {
        id: 2,
        title: "미니멀 포스터 컬렉션",
        previewUrl: img202505041205234,
        frameUrl: img202505041205234,
        viewCount: "2.2K",
        likeCount: "445",
        createdDate: "2024.12.10",
    },
    {
        id: 3,
        title: "test",
        previewUrl: img202505041205234,
        frameUrl: test_img,
        viewCount: "1.0K",
        likeCount: "189",
        createdDate: "2024.12.08",
    },
    // {
    //     id: 4,
    //     title: "타이포그래피 프로젝트",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.7K",
    //     likeCount: "267",
    //     createdDate: "2024.12.05",
    // },
    // {
    //     id: 5,
    //     title: "웹 디자인 시스템",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.7K",
    //     likeCount: "312",
    //     createdDate: "2024.12.01",
    // },
    // {
    //     id: 6,
    //     title: "아이콘 세트 디자인",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.7K",
    //     likeCount: "198",
    //     createdDate: "2024.11.28",
    // },
    // {
    //     id: 7,
    //     title: "UI/UX 디자인 프로젝트",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "2.5K",
    //     likeCount: "456",
    //     createdDate: "2024.11.25",
    // },
    // {
    //     id: 9,
    //     title: "로고 디자인 컬렉션",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.9K",
    //     likeCount: "378",
    //     createdDate: "2024.11.22",
    // },
    // {
    //     id: 10,
    //     title: "패키지 디자인",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.4K",
    //     likeCount: "234",
    //     createdDate: "2024.11.20",
    // },
    // {
    //     id: 11,
    //     title: "웹사이트 리디자인",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "3.1K",
    //     likeCount: "567",
    //     createdDate: "2024.11.18",
    // },
    // {
    //     id: 12,
    //     title: "모바일 앱 디자인",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "2.8K",
    //     likeCount: "423",
    //     createdDate: "2024.11.15",
    // },
    // {
    //     id: 13,
    //     title: "인포그래픽 디자인",
    //     previewUrl: img202505041205234,
    //     frameUrl: img202505041205234,
    //     viewCount: "1.6K",
    //     likeCount: "298",
    //     createdDate: "2024.11.12",
    // },
];