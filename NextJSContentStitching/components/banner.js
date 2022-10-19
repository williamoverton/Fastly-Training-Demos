
export default function Banner({content}) {
  return (
    <div class="container mx-auto flex items-center flex-wrap mt-5 p-5 bg-slate-100">
      <div dangerouslySetInnerHTML={{__html: content}}></div>
    </div>
  )
}