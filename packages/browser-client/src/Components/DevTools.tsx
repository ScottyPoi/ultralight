import { ENR } from '@chainsafe/discv5'
import {
  Input,
  Heading,
  Menu,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Box,
  VStack,
  Divider,
} from '@chakra-ui/react'
import { HistoryNetworkContentKeyUnionType, PortalNetwork, SubNetworkIds } from 'portalnetwork'
import React, { useState } from 'react'
import { ContentManager } from './ContentManager'

interface DevToolsProps {
  portal: PortalNetwork
  peers: ENR[]
}

export default function DevTools(props: DevToolsProps) {
  const portal = props.portal
  const peers = props.peers.map((p) => {
    return p.nodeId
  })
  const [peer, setPeer] = useState(peers[0])
  const [distance, setDistance] = useState('')
  const [contentKey, setContentKey] = useState('')
  const handlePing = (nodeId: string) => {
    portal.sendPing(nodeId, SubNetworkIds.HistoryNetwork)
  }

  const handleFindNodes = (nodeId: string) => {
    portal.sendFindNodes(
      nodeId,
      Uint16Array.from([parseInt(distance)]),
      SubNetworkIds.HistoryNetwork
    )
  }

  const handleOffer = (nodeId: string) => {
    if (contentKey.slice(0, 2) !== '0x') {
      setContentKey('')
      return
    }
    const encodedContentKey = HistoryNetworkContentKeyUnionType.serialize({
      selector: 0,
      value: { chainId: 1, blockHash: Buffer.from(contentKey.slice(2), 'hex') },
    })
    portal.sendOffer(nodeId, [encodedContentKey], SubNetworkIds.HistoryNetwork)
  }
  return (
    <VStack>
      <Heading size="sm">Manually Interact with Network</Heading>
      <Divider />
      <ContentManager portal={portal} />
      <Divider />
      <Button size="sm" width="100%" onClick={() => handlePing(peer)}>
        Send Ping
      </Button>
      <Divider />
      <Input
        placeholder={'Distance'}
        onChange={(evt) => {
          setDistance(evt.target.value)
        }}
      />
      <Button size="sm" width="100%" onClick={() => handleFindNodes(peer)}>
        Request Nodes from Peer
      </Button>
      <Divider />
      <Input
        value={contentKey}
        placeholder="Content Key"
        onChange={(evt) => setContentKey(evt.target.value)}
      />
      <Button width={'100%'} size="sm" onClick={() => handleOffer(peer)}>
        Send Offer
      </Button>
      <Divider />
      <Heading size="sm">
        Select Peer ({peers.indexOf(peer) + 1}/{peers.length})
      </Heading>
      <Box overflow={'scroll'} paddingTop={1} border="solid black" h="150px" w="100%">
        <Menu autoSelect>
          <MenuOptionGroup fontSize={'xs'} onChange={(p) => setPeer(p as string)}>
            {peers.map((_peer, idx) => (
              <MenuItemOption
                fontSize={'xs'}
                paddingStart={0}
                bgColor={peer === _peer ? 'lightblue' : 'white'}
                key={idx}
                value={_peer}
              >
                {_peer.slice(0, 25)}...
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </Menu>
      </Box>
      <Divider />
    </VStack>
  )
}
