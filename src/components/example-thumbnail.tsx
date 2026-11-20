import { Globe2 } from "lucide-react";
import type { BusinessExample } from "@/lib/examples";
import "./example-collection.css";

export function ExampleThumbnail({ example }: { example: BusinessExample }) {
  return <div className="collection-window" aria-hidden="true">
    <div className="collection-address"><span><i /><i /><i /></span><Globe2 size={12} />{example.content.name}의 홈페이지</div>
    <div className={`collection-preview top-${example.content.layout.top} middle-${example.content.layout.middle}`}>
      <div className="collection-nav"><strong>{example.content.name}</strong><span>소개　이야기　문의</span></div>
      <div className="collection-hero"><div><span>{example.category}</span><strong>{example.content.tagline}</strong><b>더 알아보기</b></div><img src={example.hero} alt="" width={1440} height={960} loading="lazy" /></div>
      <div className="collection-content">{example.content.layout.middle === "gallery" ? <>{example.content.projects.slice(0, 3).map(project => <img key={project.id} src={example.imageSources[project.image!.id]} alt="" width={600} height={400} loading="lazy" />)}</> : example.content.services.slice(0, 3).map((service, index) => <div key={service.id}><span>0{index + 1}</span><strong>{service.title}</strong><i /></div>)}</div>
    </div>
  </div>;
}
