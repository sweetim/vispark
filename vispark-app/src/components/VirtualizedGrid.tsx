import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  InfiniteLoader,
  List,
  WindowScroller,
} from "react-virtualized"
import "react-virtualized/styles.css"
import { useRef } from "react"
import VideoMetadataCard from "./VideoMetadataCard"
import ProcessingIndicator from "./ProcessingIndicator"

type VirtualizedItem = {
  id?: string
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
  createdTime: string | undefined
  isNewFromCallback?: boolean
}

type VirtualizedGridProps = {
  items: VirtualizedItem[]
  isLoading: boolean
  isLoadingMore: boolean
  loadMoreRows: () => Promise<void>
  rowCount: number
  scrollElement: HTMLElement | null
  emptyMessage: string
  errorMessage: string
  error: any
  onItemClick: (item: VirtualizedItem) => void
  processingVideoId: string | null
  processingStatus: "idle" | "gathering" | "summarizing" | "complete" | "error"
}

const VirtualizedGrid = ({
  items,
  isLoading,
  isLoadingMore,
  loadMoreRows,
  rowCount,
  scrollElement,
  emptyMessage,
  errorMessage,
  error,
  onItemClick,
  processingVideoId,
  processingStatus
}: VirtualizedGridProps) => {
  const cache = useRef(new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 220,
    minHeight: 180,
    keyMapper: (index) => index
  }))

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <p className="text-red-400">{errorMessage}: {error.message}</p>
      </div>
    )
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <WindowScroller scrollElement={scrollElement || undefined}>
        {({ height, isScrolling, onChildScroll, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width }) => {
              const columnCount = width > 1024 ? 3 : width > 768 ? 2 : 1
              const columnWidth = width / columnCount
              const rowCountCalculated = Math.ceil(rowCount / columnCount)

              const rowRenderer = ({ index, key, parent, style }: { index: number, key: string, parent: any, style: React.CSSProperties }) => {
                const startIndex = index * columnCount
                const rowItems = items.slice(startIndex, startIndex + columnCount)

                return (
                  <CellMeasurer
                    cache={cache.current}
                    columnIndex={0}
                    rowIndex={index}
                    parent={parent}
                    key={key}
                  >
                    {({ measure, registerChild }) => (
                      <div
                        style={{...style}}
                        ref={(element) => {
                          if (element) {
                            registerChild(element)
                            setTimeout(() => {
                              cache.current.clear(index, 0)
                              measure()
                            }, 0)
                          }
                        }}
                        className="flex gap-2 p-1"
                      >
                        {rowItems.map((item) => (
                          <div
                            key={item.id || item.videoId}
                            style={{ width: columnWidth - 8 }}
                            className="flex-shrink-0"
                          >
                            <div className="group relative transform transition-all duration-300 hover:scale-105">
                              <div className="absolute -inset-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                              <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                                <VideoMetadataCard
                                  metadata={{
                                    videoId: item.videoId,
                                    title: item.title,
                                    channelId: "",
                                    channelTitle: item.channelTitle,
                                    thumbnails: item.thumbnail,
                                  }}
                                  createdTime={item.createdTime}
                                  isNewFromCallback={item.isNewFromCallback || false}
                                  isSummarizing={processingVideoId === item.videoId && (processingStatus === "gathering" || processingStatus === "summarizing")}
                                  onClick={() => onItemClick(item)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CellMeasurer>
                )
              }

              return (
                <InfiniteLoader
                  isRowLoaded={({ index }) => {
                    const startIndex = index * columnCount
                    return startIndex < items.length
                  }}
                  loadMoreRows={async () => {
                    await loadMoreRows()
                    cache.current.clearAll()
                  }}
                  rowCount={rowCountCalculated}
                  threshold={5}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                      autoHeight
                      height={height}
                      isScrolling={isScrolling}
                      onScroll={onChildScroll}
                      scrollTop={scrollTop}
                      width={width}
                      rowCount={rowCountCalculated}
                      rowHeight={cache.current.rowHeight}
                      rowRenderer={rowRenderer}
                      onRowsRendered={onRowsRendered}
                      ref={registerChild}
                      deferredMeasurementCache={cache.current}
                      overscanRowCount={3}
                    />
                  )}
                </InfiniteLoader>
              )
            }}
          </AutoSizer>
        )}
      </WindowScroller>
      {isLoadingMore && (
        <div className="py-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default VirtualizedGrid
