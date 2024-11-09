from onvif2 import ONVIFCamera
import sys
import os
from typing import List, Dict, Optional, Union

base_dir = os.path.dirname(os.path.abspath(__file__))  
wsdl_dir = os.path.join(base_dir, 'wsdl')

sys.path.append("../")

def get_onvif_rtsp_address_list(ip: str, port: int = 80, id: Optional[str] = None, passwd: Optional[str] = None) -> List[Dict[str, Union[str, int]]]:
    mycam = ONVIFCamera(ip, port, id, passwd, wsdl_dir=wsdl_dir, adjust_time=True)
    media_service2 = mycam.create_media2_service()
    profiles = media_service2.GetProfiles()
    configurations = media_service2.GetVideoEncoderConfigurations()

    configuration_list = [c for c in configurations if c.UseCount != 0]

    results = []
    for p, c in zip(profiles, configuration_list):
        o = media_service2.create_type('GetStreamUri')
        o.ProfileToken = p.token
        o.Protocol = 'RTSP'
        uri_response = media_service2.GetStreamUri(o)

        uri = uri_response if isinstance(uri_response, str) else uri_response.Uri
        rtsp_uri = uri if passwd is None else f'rtsp://{id}:{passwd}@{uri[7:]}'

        result = {
            'width': c.Resolution.Width,
            'height': c.Resolution.Height,
            'codec': c.Encoding.lower(),
            'fps': int(c.RateControl.FrameRateLimit),
            'rtsp': rtsp_uri
        }

        results.append(result)

    return results
