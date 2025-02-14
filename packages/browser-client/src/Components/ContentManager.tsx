import { Button } from '@chakra-ui/react'
import { PortalNetwork, addRLPSerializedBlock, getHistoryNetworkContentId } from 'portalnetwork'
import React from 'react'
import { distance } from '@chainsafe/discv5'

interface ContentManagerProps {
  portal: PortalNetwork
}
export const ContentManager: React.FC<ContentManagerProps> = ({ portal }) => {
  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = evt.target.files
    const reader = new FileReader()
    if (files && files.length > 0) {
      reader.onload = async function () {
        if (reader.result) {
          const data = JSON.parse(reader.result as string)
          const arrayData = Object.entries(data)
          arrayData
            .sort((a, b) => {
              const diff =
                distance(
                  portal.client.enr.nodeId,
                  getHistoryNetworkContentId(1, a[0], 1).slice(2)
                ) -
                distance(portal.client.enr.nodeId, getHistoryNetworkContentId(1, b[0], 1).slice(2))
              const res = diff < 0n ? -1 : 1
              return res
            })
            .slice(0, 10)
            .forEach(async (block) => {
              addRLPSerializedBlock((block[1] as any).rlp, block[0], portal)
            })
        }
      }
      reader.readAsText(files[0])
    }
  }

  const handleClick = () => {
    const fileInputEl = document.createElement('input')
    fileInputEl.type = 'file'
    fileInputEl.accept = 'application/json'
    fileInputEl.style.display = 'none'
    document.body.appendChild(fileInputEl)
    fileInputEl.addEventListener('input', function (e) {
      handleUpload(e as any)
      document.body.removeChild(fileInputEl)
    })
    fileInputEl.click()
  }

  return (
    <Button width={'100%'} onClick={handleClick}>
      Load Blocks from File
    </Button>
  )
}
