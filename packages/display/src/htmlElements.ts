import { View, ConfigurableElement, SpecialElements, SpecialElementBuilder } from "./view.js";
import { SpecialAttributes } from "./viewConfig.js";
import { SVGElements, SvgElementAttributes } from "./svgElements.js";
import { Stateful } from "@spheres/store";

export interface GlobalHTMLAttributes {
    accesskey(value: string | Stateful<string>): this;
    autocapitalize(value: string | Stateful<string>): this;
    autofocus(value: boolean | Stateful<boolean>): this;
    class(value: string | Stateful<string>): this;
    contenteditable(value: string | Stateful<string>): this;
    dir(value: string | Stateful<string>): this;
    draggable(value: string | Stateful<string>): this;
    enterkeyhint(value: string | Stateful<string>): this;
    hidden(value: string | Stateful<string>): this;
    id(value: string | Stateful<string>): this;
    inert(value: boolean | Stateful<boolean>): this;
    inputmode(value: string | Stateful<string>): this;
    is(value: string | Stateful<string>): this;
    itemid(value: string | Stateful<string>): this;
    itemprop(value: string | Stateful<string>): this;
    itemref(value: string | Stateful<string>): this;
    itemscope(value: boolean | Stateful<boolean>): this;
    itemtype(value: string | Stateful<string>): this;
    lang(value: string | Stateful<string>): this;
    nonce(value: string | Stateful<string>): this;
    popover(value: string | Stateful<string>): this;
    slot(value: string | Stateful<string>): this;
    spellcheck(value: string | Stateful<string>): this;
    style(value: string | Stateful<string>): this;
    tabindex(value: string | Stateful<string>): this;
    title(value: string | Stateful<string>): this;
    translate(value: string | Stateful<string>): this;
    role(value: string | Stateful<string>): this;
}

export interface HTMLBuilder extends SpecialElementBuilder {
    a(builder?: (element: ConfigurableElement<AElementAttributes, HTMLElements>) => void): View;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes, HTMLElements>) => void): View;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes, HTMLElements>) => void): View;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes, HTMLElements>) => void): View;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes, HTMLElements>) => void): View;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes, HTMLElements>) => void): View;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes, HTMLElements>) => void): View;
    b(builder?: (element: ConfigurableElement<BElementAttributes, HTMLElements>) => void): View;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes, HTMLElements>) => void): View;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes, HTMLElements>) => void): View;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes, HTMLElements>) => void): View;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes, HTMLElements>) => void): View;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes, HTMLElements>) => void): View;
    br(builder?: (element: ConfigurableElement<BrElementAttributes, HTMLElements>) => void): View;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes, HTMLElements>) => void): View;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes, HTMLElements>) => void): View;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes, HTMLElements>) => void): View;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes, HTMLElements>) => void): View;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes, HTMLElements>) => void): View;
    col(builder?: (element: ConfigurableElement<ColElementAttributes, HTMLElements>) => void): View;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes, HTMLElements>) => void): View;
    data(builder?: (element: ConfigurableElement<DataElementAttributes, HTMLElements>) => void): View;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes, HTMLElements>) => void): View;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes, HTMLElements>) => void): View;
    del(builder?: (element: ConfigurableElement<DelElementAttributes, HTMLElements>) => void): View;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes, HTMLElements>) => void): View;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes, HTMLElements>) => void): View;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes, HTMLElements>) => void): View;
    div(builder?: (element: ConfigurableElement<DivElementAttributes, HTMLElements>) => void): View;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes, HTMLElements>) => void): View;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes, HTMLElements>) => void): View;
    em(builder?: (element: ConfigurableElement<EmElementAttributes, HTMLElements>) => void): View;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes, HTMLElements>) => void): View;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes, HTMLElements>) => void): View;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes, HTMLElements>) => void): View;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes, HTMLElements>) => void): View;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes, HTMLElements>) => void): View;
    form(builder?: (element: ConfigurableElement<FormElementAttributes, HTMLElements>) => void): View;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes, HTMLElements>) => void): View;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes, HTMLElements>) => void): View;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes, HTMLElements>) => void): View;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes, HTMLElements>) => void): View;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes, HTMLElements>) => void): View;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes, HTMLElements>) => void): View;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLElements>) => void): View;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes, HTMLElements>) => void): View;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes, HTMLElements>) => void): View;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes, HTMLElements>) => void): View;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes, HTMLElements>) => void): View;
    i(builder?: (element: ConfigurableElement<IElementAttributes, HTMLElements>) => void): View;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes, HTMLElements>) => void): View;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes, HTMLElements>) => void): View;
    input(builder?: (element: ConfigurableElement<InputElementAttributes, HTMLElements>) => void): View;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes, HTMLElements>) => void): View;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes, HTMLElements>) => void): View;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes, HTMLElements>) => void): View;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes, HTMLElements>) => void): View;
    li(builder?: (element: ConfigurableElement<LiElementAttributes, HTMLElements>) => void): View;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes, HTMLElements>) => void): View;
    main(builder?: (element: ConfigurableElement<MainElementAttributes, HTMLElements>) => void): View;
    map(builder?: (element: ConfigurableElement<MapElementAttributes, HTMLElements>) => void): View;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes, HTMLElements>) => void): View;
    math(builder?: (element: ConfigurableElement<MathElementAttributes, HTMLElements>) => void): View;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes, HTMLElements>) => void): View;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes, HTMLElements>) => void): View;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes, HTMLElements>) => void): View;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes, HTMLElements>) => void): View;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes, HTMLElements>) => void): View;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes, HTMLElements>) => void): View;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes, HTMLElements>) => void): View;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes, HTMLElements>) => void): View;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes, HTMLElements>) => void): View;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes, HTMLElements>) => void): View;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes, HTMLElements>) => void): View;
    p(builder?: (element: ConfigurableElement<PElementAttributes, HTMLElements>) => void): View;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes, HTMLElements>) => void): View;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes, HTMLElements>) => void): View;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes, HTMLElements>) => void): View;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes, HTMLElements>) => void): View;
    q(builder?: (element: ConfigurableElement<QElementAttributes, HTMLElements>) => void): View;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes, HTMLElements>) => void): View;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes, HTMLElements>) => void): View;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes, HTMLElements>) => void): View;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes, HTMLElements>) => void): View;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes, HTMLElements>) => void): View;
    s(builder?: (element: ConfigurableElement<SElementAttributes, HTMLElements>) => void): View;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes, HTMLElements>) => void): View;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void): View;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes, HTMLElements>) => void): View;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes, HTMLElements>) => void): View;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes, HTMLElements>) => void): View;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes, HTMLElements>) => void): View;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes, HTMLElements>) => void): View;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes, HTMLElements>) => void): View;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes, HTMLElements>) => void): View;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes, HTMLElements>) => void): View;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes, HTMLElements>) => void): View;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes, HTMLElements>) => void): View;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes, HTMLElements>) => void): View;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes, HTMLElements>) => void): View;
    svg(builder?: (element: ConfigurableElement<SvgElementAttributes, SVGElements>) => void): View;
    table(builder?: (element: ConfigurableElement<TableElementAttributes, HTMLElements>) => void): View;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes, HTMLElements>) => void): View;
    td(builder?: (element: ConfigurableElement<TdElementAttributes, HTMLElements>) => void): View;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes, HTMLElements>) => void): View;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes, HTMLElements>) => void): View;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes, HTMLElements>) => void): View;
    th(builder?: (element: ConfigurableElement<ThElementAttributes, HTMLElements>) => void): View;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes, HTMLElements>) => void): View;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes, HTMLElements>) => void): View;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes, HTMLElements>) => void): View;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes, HTMLElements>) => void): View;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes, HTMLElements>) => void): View;
    u(builder?: (element: ConfigurableElement<UElementAttributes, HTMLElements>) => void): View;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes, HTMLElements>) => void): View;
    var(builder?: (element: ConfigurableElement<VarElementAttributes, HTMLElements>) => void): View;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes, HTMLElements>) => void): View;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes, HTMLElements>) => void): View;
}

export interface HTMLElements extends SpecialElements {
    a(builder?: (element: ConfigurableElement<AElementAttributes, HTMLElements>) => void): this;
    abbr(builder?: (element: ConfigurableElement<AbbrElementAttributes, HTMLElements>) => void): this;
    address(builder?: (element: ConfigurableElement<AddressElementAttributes, HTMLElements>) => void): this;
    area(builder?: (element: ConfigurableElement<AreaElementAttributes, HTMLElements>) => void): this;
    article(builder?: (element: ConfigurableElement<ArticleElementAttributes, HTMLElements>) => void): this;
    aside(builder?: (element: ConfigurableElement<AsideElementAttributes, HTMLElements>) => void): this;
    audio(builder?: (element: ConfigurableElement<AudioElementAttributes, HTMLElements>) => void): this;
    b(builder?: (element: ConfigurableElement<BElementAttributes, HTMLElements>) => void): this;
    base(builder?: (element: ConfigurableElement<BaseElementAttributes, HTMLElements>) => void): this;
    bdi(builder?: (element: ConfigurableElement<BdiElementAttributes, HTMLElements>) => void): this;
    bdo(builder?: (element: ConfigurableElement<BdoElementAttributes, HTMLElements>) => void): this;
    blockquote(builder?: (element: ConfigurableElement<BlockquoteElementAttributes, HTMLElements>) => void): this;
    body(builder?: (element: ConfigurableElement<BodyElementAttributes, HTMLElements>) => void): this;
    br(builder?: (element: ConfigurableElement<BrElementAttributes, HTMLElements>) => void): this;
    button(builder?: (element: ConfigurableElement<ButtonElementAttributes, HTMLElements>) => void): this;
    canvas(builder?: (element: ConfigurableElement<CanvasElementAttributes, HTMLElements>) => void): this;
    caption(builder?: (element: ConfigurableElement<CaptionElementAttributes, HTMLElements>) => void): this;
    cite(builder?: (element: ConfigurableElement<CiteElementAttributes, HTMLElements>) => void): this;
    code(builder?: (element: ConfigurableElement<CodeElementAttributes, HTMLElements>) => void): this;
    col(builder?: (element: ConfigurableElement<ColElementAttributes, HTMLElements>) => void): this;
    colgroup(builder?: (element: ConfigurableElement<ColgroupElementAttributes, HTMLElements>) => void): this;
    data(builder?: (element: ConfigurableElement<DataElementAttributes, HTMLElements>) => void): this;
    datalist(builder?: (element: ConfigurableElement<DatalistElementAttributes, HTMLElements>) => void): this;
    dd(builder?: (element: ConfigurableElement<DdElementAttributes, HTMLElements>) => void): this;
    del(builder?: (element: ConfigurableElement<DelElementAttributes, HTMLElements>) => void): this;
    details(builder?: (element: ConfigurableElement<DetailsElementAttributes, HTMLElements>) => void): this;
    dfn(builder?: (element: ConfigurableElement<DfnElementAttributes, HTMLElements>) => void): this;
    dialog(builder?: (element: ConfigurableElement<DialogElementAttributes, HTMLElements>) => void): this;
    div(builder?: (element: ConfigurableElement<DivElementAttributes, HTMLElements>) => void): this;
    dl(builder?: (element: ConfigurableElement<DlElementAttributes, HTMLElements>) => void): this;
    dt(builder?: (element: ConfigurableElement<DtElementAttributes, HTMLElements>) => void): this;
    em(builder?: (element: ConfigurableElement<EmElementAttributes, HTMLElements>) => void): this;
    embed(builder?: (element: ConfigurableElement<EmbedElementAttributes, HTMLElements>) => void): this;
    fieldset(builder?: (element: ConfigurableElement<FieldsetElementAttributes, HTMLElements>) => void): this;
    figcaption(builder?: (element: ConfigurableElement<FigcaptionElementAttributes, HTMLElements>) => void): this;
    figure(builder?: (element: ConfigurableElement<FigureElementAttributes, HTMLElements>) => void): this;
    footer(builder?: (element: ConfigurableElement<FooterElementAttributes, HTMLElements>) => void): this;
    form(builder?: (element: ConfigurableElement<FormElementAttributes, HTMLElements>) => void): this;
    h1(builder?: (element: ConfigurableElement<H1ElementAttributes, HTMLElements>) => void): this;
    h2(builder?: (element: ConfigurableElement<H2ElementAttributes, HTMLElements>) => void): this;
    h3(builder?: (element: ConfigurableElement<H3ElementAttributes, HTMLElements>) => void): this;
    h4(builder?: (element: ConfigurableElement<H4ElementAttributes, HTMLElements>) => void): this;
    h5(builder?: (element: ConfigurableElement<H5ElementAttributes, HTMLElements>) => void): this;
    h6(builder?: (element: ConfigurableElement<H6ElementAttributes, HTMLElements>) => void): this;
    head(builder?: (element: ConfigurableElement<HeadElementAttributes, HTMLElements>) => void): this;
    header(builder?: (element: ConfigurableElement<HeaderElementAttributes, HTMLElements>) => void): this;
    hgroup(builder?: (element: ConfigurableElement<HgroupElementAttributes, HTMLElements>) => void): this;
    hr(builder?: (element: ConfigurableElement<HrElementAttributes, HTMLElements>) => void): this;
    html(builder?: (element: ConfigurableElement<HtmlElementAttributes, HTMLElements>) => void): this;
    i(builder?: (element: ConfigurableElement<IElementAttributes, HTMLElements>) => void): this;
    iframe(builder?: (element: ConfigurableElement<IframeElementAttributes, HTMLElements>) => void): this;
    img(builder?: (element: ConfigurableElement<ImgElementAttributes, HTMLElements>) => void): this;
    input(builder?: (element: ConfigurableElement<InputElementAttributes, HTMLElements>) => void): this;
    ins(builder?: (element: ConfigurableElement<InsElementAttributes, HTMLElements>) => void): this;
    kbd(builder?: (element: ConfigurableElement<KbdElementAttributes, HTMLElements>) => void): this;
    label(builder?: (element: ConfigurableElement<LabelElementAttributes, HTMLElements>) => void): this;
    legend(builder?: (element: ConfigurableElement<LegendElementAttributes, HTMLElements>) => void): this;
    li(builder?: (element: ConfigurableElement<LiElementAttributes, HTMLElements>) => void): this;
    link(builder?: (element: ConfigurableElement<LinkElementAttributes, HTMLElements>) => void): this;
    main(builder?: (element: ConfigurableElement<MainElementAttributes, HTMLElements>) => void): this;
    map(builder?: (element: ConfigurableElement<MapElementAttributes, HTMLElements>) => void): this;
    mark(builder?: (element: ConfigurableElement<MarkElementAttributes, HTMLElements>) => void): this;
    math(builder?: (element: ConfigurableElement<MathElementAttributes, HTMLElements>) => void): this;
    menu(builder?: (element: ConfigurableElement<MenuElementAttributes, HTMLElements>) => void): this;
    menuitem(builder?: (element: ConfigurableElement<MenuitemElementAttributes, HTMLElements>) => void): this;
    meta(builder?: (element: ConfigurableElement<MetaElementAttributes, HTMLElements>) => void): this;
    meter(builder?: (element: ConfigurableElement<MeterElementAttributes, HTMLElements>) => void): this;
    nav(builder?: (element: ConfigurableElement<NavElementAttributes, HTMLElements>) => void): this;
    noscript(builder?: (element: ConfigurableElement<NoscriptElementAttributes, HTMLElements>) => void): this;
    object(builder?: (element: ConfigurableElement<ObjectElementAttributes, HTMLElements>) => void): this;
    ol(builder?: (element: ConfigurableElement<OlElementAttributes, HTMLElements>) => void): this;
    optgroup(builder?: (element: ConfigurableElement<OptgroupElementAttributes, HTMLElements>) => void): this;
    option(builder?: (element: ConfigurableElement<OptionElementAttributes, HTMLElements>) => void): this;
    output(builder?: (element: ConfigurableElement<OutputElementAttributes, HTMLElements>) => void): this;
    p(builder?: (element: ConfigurableElement<PElementAttributes, HTMLElements>) => void): this;
    param(builder?: (element: ConfigurableElement<ParamElementAttributes, HTMLElements>) => void): this;
    picture(builder?: (element: ConfigurableElement<PictureElementAttributes, HTMLElements>) => void): this;
    pre(builder?: (element: ConfigurableElement<PreElementAttributes, HTMLElements>) => void): this;
    progress(builder?: (element: ConfigurableElement<ProgressElementAttributes, HTMLElements>) => void): this;
    q(builder?: (element: ConfigurableElement<QElementAttributes, HTMLElements>) => void): this;
    rb(builder?: (element: ConfigurableElement<RbElementAttributes, HTMLElements>) => void): this;
    rp(builder?: (element: ConfigurableElement<RpElementAttributes, HTMLElements>) => void): this;
    rt(builder?: (element: ConfigurableElement<RtElementAttributes, HTMLElements>) => void): this;
    rtc(builder?: (element: ConfigurableElement<RtcElementAttributes, HTMLElements>) => void): this;
    ruby(builder?: (element: ConfigurableElement<RubyElementAttributes, HTMLElements>) => void): this;
    s(builder?: (element: ConfigurableElement<SElementAttributes, HTMLElements>) => void): this;
    samp(builder?: (element: ConfigurableElement<SampElementAttributes, HTMLElements>) => void): this;
    script(builder?: (element: ConfigurableElement<ScriptElementAttributes, HTMLElements>) => void): this;
    search(builder?: (element: ConfigurableElement<SearchElementAttributes, HTMLElements>) => void): this;
    section(builder?: (element: ConfigurableElement<SectionElementAttributes, HTMLElements>) => void): this;
    select(builder?: (element: ConfigurableElement<SelectElementAttributes, HTMLElements>) => void): this;
    slot(builder?: (element: ConfigurableElement<SlotElementAttributes, HTMLElements>) => void): this;
    small(builder?: (element: ConfigurableElement<SmallElementAttributes, HTMLElements>) => void): this;
    source(builder?: (element: ConfigurableElement<SourceElementAttributes, HTMLElements>) => void): this;
    span(builder?: (element: ConfigurableElement<SpanElementAttributes, HTMLElements>) => void): this;
    strong(builder?: (element: ConfigurableElement<StrongElementAttributes, HTMLElements>) => void): this;
    style(builder?: (element: ConfigurableElement<StyleElementAttributes, HTMLElements>) => void): this;
    sub(builder?: (element: ConfigurableElement<SubElementAttributes, HTMLElements>) => void): this;
    summary(builder?: (element: ConfigurableElement<SummaryElementAttributes, HTMLElements>) => void): this;
    sup(builder?: (element: ConfigurableElement<SupElementAttributes, HTMLElements>) => void): this;
    svg(builder?: (element: ConfigurableElement<SvgElementAttributes, SVGElements>) => void): this;
    table(builder?: (element: ConfigurableElement<TableElementAttributes, HTMLElements>) => void): this;
    tbody(builder?: (element: ConfigurableElement<TbodyElementAttributes, HTMLElements>) => void): this;
    td(builder?: (element: ConfigurableElement<TdElementAttributes, HTMLElements>) => void): this;
    template(builder?: (element: ConfigurableElement<TemplateElementAttributes, HTMLElements>) => void): this;
    textarea(builder?: (element: ConfigurableElement<TextareaElementAttributes, HTMLElements>) => void): this;
    tfoot(builder?: (element: ConfigurableElement<TfootElementAttributes, HTMLElements>) => void): this;
    th(builder?: (element: ConfigurableElement<ThElementAttributes, HTMLElements>) => void): this;
    thead(builder?: (element: ConfigurableElement<TheadElementAttributes, HTMLElements>) => void): this;
    time(builder?: (element: ConfigurableElement<TimeElementAttributes, HTMLElements>) => void): this;
    title(builder?: (element: ConfigurableElement<TitleElementAttributes, HTMLElements>) => void): this;
    tr(builder?: (element: ConfigurableElement<TrElementAttributes, HTMLElements>) => void): this;
    track(builder?: (element: ConfigurableElement<TrackElementAttributes, HTMLElements>) => void): this;
    u(builder?: (element: ConfigurableElement<UElementAttributes, HTMLElements>) => void): this;
    ul(builder?: (element: ConfigurableElement<UlElementAttributes, HTMLElements>) => void): this;
    var(builder?: (element: ConfigurableElement<VarElementAttributes, HTMLElements>) => void): this;
    video(builder?: (element: ConfigurableElement<VideoElementAttributes, HTMLElements>) => void): this;
    wbr(builder?: (element: ConfigurableElement<WbrElementAttributes, HTMLElements>) => void): this;
}

export interface AElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    charset(value: string | Stateful<string>): AElementAttributes;
    coords(value: string | Stateful<string>): AElementAttributes;
    download(value: string | Stateful<string>): AElementAttributes;
    href(value: string | Stateful<string>): AElementAttributes;
    hreflang(value: string | Stateful<string>): AElementAttributes;
    name(value: string | Stateful<string>): AElementAttributes;
    ping(value: string | Stateful<string>): AElementAttributes;
    referrerpolicy(value: string | Stateful<string>): AElementAttributes;
    rel(value: string | Stateful<string>): AElementAttributes;
    rev(value: string | Stateful<string>): AElementAttributes;
    shape(value: string | Stateful<string>): AElementAttributes;
    target(value: string | Stateful<string>): AElementAttributes;
    type(value: string | Stateful<string>): AElementAttributes;
}

export interface AbbrElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface AddressElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface AreaElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    alt(value: string | Stateful<string>): AreaElementAttributes;
    coords(value: string | Stateful<string>): AreaElementAttributes;
    download(value: string | Stateful<string>): AreaElementAttributes;
    href(value: string | Stateful<string>): AreaElementAttributes;
    hreflang(value: string | Stateful<string>): AreaElementAttributes;
    nohref(value: string | Stateful<string>): AreaElementAttributes;
    ping(value: string | Stateful<string>): AreaElementAttributes;
    referrerpolicy(value: string | Stateful<string>): AreaElementAttributes;
    rel(value: string | Stateful<string>): AreaElementAttributes;
    shape(value: string | Stateful<string>): AreaElementAttributes;
    target(value: string | Stateful<string>): AreaElementAttributes;
    type(value: string | Stateful<string>): AreaElementAttributes;
}

export interface ArticleElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface AsideElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface AudioElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean>): AudioElementAttributes;
    controls(value: boolean | Stateful<boolean>): AudioElementAttributes;
    crossorigin(value: string | Stateful<string>): AudioElementAttributes;
    loop(value: boolean | Stateful<boolean>): AudioElementAttributes;
    muted(value: boolean | Stateful<boolean>): AudioElementAttributes;
    preload(value: string | Stateful<string>): AudioElementAttributes;
    src(value: string | Stateful<string>): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface BaseElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    href(value: string | Stateful<string>): BaseElementAttributes;
    target(value: string | Stateful<string>): BaseElementAttributes;
}

export interface BdiElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface BdoElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface BlockquoteElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    alink(value: string | Stateful<string>): BodyElementAttributes;
    background(value: string | Stateful<string>): BodyElementAttributes;
    bgcolor(value: string | Stateful<string>): BodyElementAttributes;
    link(value: string | Stateful<string>): BodyElementAttributes;
    text(value: string | Stateful<string>): BodyElementAttributes;
    vlink(value: string | Stateful<string>): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    clear(value: string | Stateful<string>): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): ButtonElementAttributes;
    form(value: string | Stateful<string>): ButtonElementAttributes;
    formaction(value: string | Stateful<string>): ButtonElementAttributes;
    formenctype(value: string | Stateful<string>): ButtonElementAttributes;
    formmethod(value: string | Stateful<string>): ButtonElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean>): ButtonElementAttributes;
    formtarget(value: string | Stateful<string>): ButtonElementAttributes;
    name(value: string | Stateful<string>): ButtonElementAttributes;
    popovertarget(value: string | Stateful<string>): ButtonElementAttributes;
    popovertargetaction(value: string | Stateful<string>): ButtonElementAttributes;
    type(value: string | Stateful<string>): ButtonElementAttributes;
    value(value: string | Stateful<string>): ButtonElementAttributes;
}

export interface CanvasElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): CanvasElementAttributes;
    width(value: string | Stateful<string>): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): CaptionElementAttributes;
}

export interface CiteElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface CodeElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface ColElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ColElementAttributes;
    char(value: string | Stateful<string>): ColElementAttributes;
    charoff(value: string | Stateful<string>): ColElementAttributes;
    span(value: string | Stateful<string>): ColElementAttributes;
    valign(value: string | Stateful<string>): ColElementAttributes;
    width(value: string | Stateful<string>): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ColgroupElementAttributes;
    char(value: string | Stateful<string>): ColgroupElementAttributes;
    charoff(value: string | Stateful<string>): ColgroupElementAttributes;
    span(value: string | Stateful<string>): ColgroupElementAttributes;
    valign(value: string | Stateful<string>): ColgroupElementAttributes;
    width(value: string | Stateful<string>): ColgroupElementAttributes;
}

export interface DataElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    value(value: string | Stateful<string>): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface DdElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface DelElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): DelElementAttributes;
    datetime(value: string | Stateful<string>): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    open(value: boolean | Stateful<boolean>): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface DialogElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    open(value: boolean | Stateful<boolean>): DialogElementAttributes;
}

export interface DivElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface EmElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface EmbedElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): EmbedElementAttributes;
    src(value: string | Stateful<string>): EmbedElementAttributes;
    type(value: string | Stateful<string>): EmbedElementAttributes;
    width(value: string | Stateful<string>): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): FieldsetElementAttributes;
    form(value: string | Stateful<string>): FieldsetElementAttributes;
    name(value: string | Stateful<string>): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface FigureElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface FooterElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface FormElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string>): FormElementAttributes;
    acceptCharset(value: string | Stateful<string>): FormElementAttributes;
    action(value: string | Stateful<string>): FormElementAttributes;
    autocomplete(value: string | Stateful<string>): FormElementAttributes;
    enctype(value: string | Stateful<string>): FormElementAttributes;
    method(value: string | Stateful<string>): FormElementAttributes;
    name(value: string | Stateful<string>): FormElementAttributes;
    novalidate(value: boolean | Stateful<boolean>): FormElementAttributes;
    target(value: string | Stateful<string>): FormElementAttributes;
}

export interface H1ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    profile(value: string | Stateful<string>): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface HgroupElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface HrElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): HrElementAttributes;
    noshade(value: string | Stateful<string>): HrElementAttributes;
    size(value: string | Stateful<string>): HrElementAttributes;
    width(value: string | Stateful<string>): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    manifest(value: string | Stateful<string>): HtmlElementAttributes;
    version(value: string | Stateful<string>): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface IframeElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): IframeElementAttributes;
    allow(value: string | Stateful<string>): IframeElementAttributes;
    allowfullscreen(value: boolean | Stateful<boolean>): IframeElementAttributes;
    allowpaymentrequest(value: string | Stateful<string>): IframeElementAttributes;
    allowusermedia(value: string | Stateful<string>): IframeElementAttributes;
    frameborder(value: string | Stateful<string>): IframeElementAttributes;
    height(value: string | Stateful<string>): IframeElementAttributes;
    loading(value: string | Stateful<string>): IframeElementAttributes;
    longdesc(value: string | Stateful<string>): IframeElementAttributes;
    marginheight(value: string | Stateful<string>): IframeElementAttributes;
    marginwidth(value: string | Stateful<string>): IframeElementAttributes;
    name(value: string | Stateful<string>): IframeElementAttributes;
    referrerpolicy(value: string | Stateful<string>): IframeElementAttributes;
    sandbox(value: string | Stateful<string>): IframeElementAttributes;
    scrolling(value: string | Stateful<string>): IframeElementAttributes;
    src(value: string | Stateful<string>): IframeElementAttributes;
    srcdoc(value: string | Stateful<string>): IframeElementAttributes;
    width(value: string | Stateful<string>): IframeElementAttributes;
}

export interface ImgElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ImgElementAttributes;
    alt(value: string | Stateful<string>): ImgElementAttributes;
    border(value: string | Stateful<string>): ImgElementAttributes;
    crossorigin(value: string | Stateful<string>): ImgElementAttributes;
    decoding(value: string | Stateful<string>): ImgElementAttributes;
    fetchpriority(value: string | Stateful<string>): ImgElementAttributes;
    height(value: string | Stateful<string>): ImgElementAttributes;
    hspace(value: string | Stateful<string>): ImgElementAttributes;
    ismap(value: boolean | Stateful<boolean>): ImgElementAttributes;
    loading(value: string | Stateful<string>): ImgElementAttributes;
    longdesc(value: string | Stateful<string>): ImgElementAttributes;
    name(value: string | Stateful<string>): ImgElementAttributes;
    referrerpolicy(value: string | Stateful<string>): ImgElementAttributes;
    sizes(value: string | Stateful<string>): ImgElementAttributes;
    src(value: string | Stateful<string>): ImgElementAttributes;
    srcset(value: string | Stateful<string>): ImgElementAttributes;
    usemap(value: string | Stateful<string>): ImgElementAttributes;
    vspace(value: string | Stateful<string>): ImgElementAttributes;
    width(value: string | Stateful<string>): ImgElementAttributes;
}

export interface InputElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    accept(value: string | Stateful<string>): InputElementAttributes;
    align(value: string | Stateful<string>): InputElementAttributes;
    alt(value: string | Stateful<string>): InputElementAttributes;
    autocomplete(value: string | Stateful<string>): InputElementAttributes;
    checked(value: boolean | Stateful<boolean>): InputElementAttributes;
    dirname(value: string | Stateful<string>): InputElementAttributes;
    disabled(value: boolean | Stateful<boolean>): InputElementAttributes;
    form(value: string | Stateful<string>): InputElementAttributes;
    formaction(value: string | Stateful<string>): InputElementAttributes;
    formenctype(value: string | Stateful<string>): InputElementAttributes;
    formmethod(value: string | Stateful<string>): InputElementAttributes;
    formnovalidate(value: boolean | Stateful<boolean>): InputElementAttributes;
    formtarget(value: string | Stateful<string>): InputElementAttributes;
    height(value: string | Stateful<string>): InputElementAttributes;
    ismap(value: boolean | Stateful<boolean>): InputElementAttributes;
    list(value: string | Stateful<string>): InputElementAttributes;
    max(value: string | Stateful<string>): InputElementAttributes;
    maxlength(value: string | Stateful<string>): InputElementAttributes;
    min(value: string | Stateful<string>): InputElementAttributes;
    minlength(value: string | Stateful<string>): InputElementAttributes;
    multiple(value: boolean | Stateful<boolean>): InputElementAttributes;
    name(value: string | Stateful<string>): InputElementAttributes;
    pattern(value: string | Stateful<string>): InputElementAttributes;
    placeholder(value: string | Stateful<string>): InputElementAttributes;
    popovertarget(value: string | Stateful<string>): InputElementAttributes;
    popovertargetaction(value: string | Stateful<string>): InputElementAttributes;
    readonly(value: boolean | Stateful<boolean>): InputElementAttributes;
    required(value: boolean | Stateful<boolean>): InputElementAttributes;
    size(value: string | Stateful<string>): InputElementAttributes;
    src(value: string | Stateful<string>): InputElementAttributes;
    step(value: string | Stateful<string>): InputElementAttributes;
    type(value: string | Stateful<string>): InputElementAttributes;
    usemap(value: string | Stateful<string>): InputElementAttributes;
    value(value: string | Stateful<string>): InputElementAttributes;
    width(value: string | Stateful<string>): InputElementAttributes;
}

export interface InsElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): InsElementAttributes;
    datetime(value: string | Stateful<string>): InsElementAttributes;
}

export interface KbdElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface LabelElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string>): LabelElementAttributes;
    form(value: string | Stateful<string>): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    type(value: string | Stateful<string>): LiElementAttributes;
    value(value: string | Stateful<string>): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    as(value: string | Stateful<string>): LinkElementAttributes;
    blocking(value: string | Stateful<string>): LinkElementAttributes;
    charset(value: string | Stateful<string>): LinkElementAttributes;
    color(value: string | Stateful<string>): LinkElementAttributes;
    crossorigin(value: string | Stateful<string>): LinkElementAttributes;
    disabled(value: boolean | Stateful<boolean>): LinkElementAttributes;
    fetchpriority(value: string | Stateful<string>): LinkElementAttributes;
    href(value: string | Stateful<string>): LinkElementAttributes;
    hreflang(value: string | Stateful<string>): LinkElementAttributes;
    imagesizes(value: string | Stateful<string>): LinkElementAttributes;
    imagesrcset(value: string | Stateful<string>): LinkElementAttributes;
    integrity(value: string | Stateful<string>): LinkElementAttributes;
    media(value: string | Stateful<string>): LinkElementAttributes;
    referrerpolicy(value: string | Stateful<string>): LinkElementAttributes;
    rel(value: string | Stateful<string>): LinkElementAttributes;
    rev(value: string | Stateful<string>): LinkElementAttributes;
    sizes(value: string | Stateful<string>): LinkElementAttributes;
    target(value: string | Stateful<string>): LinkElementAttributes;
    type(value: string | Stateful<string>): LinkElementAttributes;
}

export interface MainElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface MapElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface MathElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface MenuElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface MetaElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    charset(value: string | Stateful<string>): MetaElementAttributes;
    content(value: string | Stateful<string>): MetaElementAttributes;
    httpEquiv(value: string | Stateful<string>): MetaElementAttributes;
    media(value: string | Stateful<string>): MetaElementAttributes;
    name(value: string | Stateful<string>): MetaElementAttributes;
    scheme(value: string | Stateful<string>): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    high(value: string | Stateful<string>): MeterElementAttributes;
    low(value: string | Stateful<string>): MeterElementAttributes;
    max(value: string | Stateful<string>): MeterElementAttributes;
    min(value: string | Stateful<string>): MeterElementAttributes;
    optimum(value: string | Stateful<string>): MeterElementAttributes;
    value(value: string | Stateful<string>): MeterElementAttributes;
}

export interface NavElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface NoscriptElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface ObjectElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): ObjectElementAttributes;
    archive(value: string | Stateful<string>): ObjectElementAttributes;
    border(value: string | Stateful<string>): ObjectElementAttributes;
    classid(value: string | Stateful<string>): ObjectElementAttributes;
    codebase(value: string | Stateful<string>): ObjectElementAttributes;
    codetype(value: string | Stateful<string>): ObjectElementAttributes;
    data(value: string | Stateful<string>): ObjectElementAttributes;
    declare(value: string | Stateful<string>): ObjectElementAttributes;
    form(value: string | Stateful<string>): ObjectElementAttributes;
    height(value: string | Stateful<string>): ObjectElementAttributes;
    hspace(value: string | Stateful<string>): ObjectElementAttributes;
    name(value: string | Stateful<string>): ObjectElementAttributes;
    standby(value: string | Stateful<string>): ObjectElementAttributes;
    type(value: string | Stateful<string>): ObjectElementAttributes;
    typemustmatch(value: string | Stateful<string>): ObjectElementAttributes;
    usemap(value: string | Stateful<string>): ObjectElementAttributes;
    vspace(value: string | Stateful<string>): ObjectElementAttributes;
    width(value: string | Stateful<string>): ObjectElementAttributes;
}

export interface OlElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): OlElementAttributes;
    reversed(value: boolean | Stateful<boolean>): OlElementAttributes;
    start(value: string | Stateful<string>): OlElementAttributes;
    type(value: string | Stateful<string>): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): OptgroupElementAttributes;
    label(value: string | Stateful<string>): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    disabled(value: boolean | Stateful<boolean>): OptionElementAttributes;
    label(value: string | Stateful<string>): OptionElementAttributes;
    selected(value: boolean | Stateful<boolean>): OptionElementAttributes;
    value(value: string | Stateful<string>): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    for(value: string | Stateful<string>): OutputElementAttributes;
    form(value: string | Stateful<string>): OutputElementAttributes;
    name(value: string | Stateful<string>): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): ParamElementAttributes;
    type(value: string | Stateful<string>): ParamElementAttributes;
    value(value: string | Stateful<string>): ParamElementAttributes;
    valuetype(value: string | Stateful<string>): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface PreElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    width(value: string | Stateful<string>): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    max(value: string | Stateful<string>): ProgressElementAttributes;
    value(value: string | Stateful<string>): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    cite(value: string | Stateful<string>): QElementAttributes;
}

export interface RbElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface RpElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface RtElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface RtcElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface RubyElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SampElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface ScriptElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    async(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    blocking(value: string | Stateful<string>): ScriptElementAttributes;
    charset(value: string | Stateful<string>): ScriptElementAttributes;
    crossorigin(value: string | Stateful<string>): ScriptElementAttributes;
    defer(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    fetchpriority(value: string | Stateful<string>): ScriptElementAttributes;
    integrity(value: string | Stateful<string>): ScriptElementAttributes;
    language(value: string | Stateful<string>): ScriptElementAttributes;
    nomodule(value: boolean | Stateful<boolean>): ScriptElementAttributes;
    referrerpolicy(value: string | Stateful<string>): ScriptElementAttributes;
    src(value: string | Stateful<string>): ScriptElementAttributes;
    type(value: string | Stateful<string>): ScriptElementAttributes;
}

export interface SearchElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SectionElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SelectElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string>): SelectElementAttributes;
    disabled(value: boolean | Stateful<boolean>): SelectElementAttributes;
    form(value: string | Stateful<string>): SelectElementAttributes;
    multiple(value: boolean | Stateful<boolean>): SelectElementAttributes;
    name(value: string | Stateful<string>): SelectElementAttributes;
    required(value: boolean | Stateful<boolean>): SelectElementAttributes;
    size(value: string | Stateful<string>): SelectElementAttributes;
}

export interface SlotElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    name(value: string | Stateful<string>): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SourceElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    height(value: string | Stateful<string>): SourceElementAttributes;
    media(value: string | Stateful<string>): SourceElementAttributes;
    sizes(value: string | Stateful<string>): SourceElementAttributes;
    src(value: string | Stateful<string>): SourceElementAttributes;
    srcset(value: string | Stateful<string>): SourceElementAttributes;
    type(value: string | Stateful<string>): SourceElementAttributes;
    width(value: string | Stateful<string>): SourceElementAttributes;
}

export interface SpanElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface StrongElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface StyleElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    blocking(value: string | Stateful<string>): StyleElementAttributes;
    media(value: string | Stateful<string>): StyleElementAttributes;
    type(value: string | Stateful<string>): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SummaryElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface SupElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface TableElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TableElementAttributes;
    bgcolor(value: string | Stateful<string>): TableElementAttributes;
    border(value: string | Stateful<string>): TableElementAttributes;
    cellpadding(value: string | Stateful<string>): TableElementAttributes;
    cellspacing(value: string | Stateful<string>): TableElementAttributes;
    frame(value: string | Stateful<string>): TableElementAttributes;
    rules(value: string | Stateful<string>): TableElementAttributes;
    summary(value: string | Stateful<string>): TableElementAttributes;
    width(value: string | Stateful<string>): TableElementAttributes;
}

export interface TbodyElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TbodyElementAttributes;
    char(value: string | Stateful<string>): TbodyElementAttributes;
    charoff(value: string | Stateful<string>): TbodyElementAttributes;
    valign(value: string | Stateful<string>): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string>): TdElementAttributes;
    align(value: string | Stateful<string>): TdElementAttributes;
    axis(value: string | Stateful<string>): TdElementAttributes;
    bgcolor(value: string | Stateful<string>): TdElementAttributes;
    char(value: string | Stateful<string>): TdElementAttributes;
    charoff(value: string | Stateful<string>): TdElementAttributes;
    colspan(value: string | Stateful<string>): TdElementAttributes;
    headers(value: string | Stateful<string>): TdElementAttributes;
    height(value: string | Stateful<string>): TdElementAttributes;
    nowrap(value: string | Stateful<string>): TdElementAttributes;
    rowspan(value: string | Stateful<string>): TdElementAttributes;
    scope(value: string | Stateful<string>): TdElementAttributes;
    valign(value: string | Stateful<string>): TdElementAttributes;
    width(value: string | Stateful<string>): TdElementAttributes;
}

export interface TemplateElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface TextareaElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    autocomplete(value: string | Stateful<string>): TextareaElementAttributes;
    cols(value: string | Stateful<string>): TextareaElementAttributes;
    dirname(value: string | Stateful<string>): TextareaElementAttributes;
    disabled(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    form(value: string | Stateful<string>): TextareaElementAttributes;
    maxlength(value: string | Stateful<string>): TextareaElementAttributes;
    minlength(value: string | Stateful<string>): TextareaElementAttributes;
    name(value: string | Stateful<string>): TextareaElementAttributes;
    placeholder(value: string | Stateful<string>): TextareaElementAttributes;
    readonly(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    required(value: boolean | Stateful<boolean>): TextareaElementAttributes;
    rows(value: string | Stateful<string>): TextareaElementAttributes;
    wrap(value: string | Stateful<string>): TextareaElementAttributes;
}

export interface TfootElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TfootElementAttributes;
    char(value: string | Stateful<string>): TfootElementAttributes;
    charoff(value: string | Stateful<string>): TfootElementAttributes;
    valign(value: string | Stateful<string>): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    abbr(value: string | Stateful<string>): ThElementAttributes;
    align(value: string | Stateful<string>): ThElementAttributes;
    axis(value: string | Stateful<string>): ThElementAttributes;
    bgcolor(value: string | Stateful<string>): ThElementAttributes;
    char(value: string | Stateful<string>): ThElementAttributes;
    charoff(value: string | Stateful<string>): ThElementAttributes;
    colspan(value: string | Stateful<string>): ThElementAttributes;
    headers(value: string | Stateful<string>): ThElementAttributes;
    height(value: string | Stateful<string>): ThElementAttributes;
    nowrap(value: string | Stateful<string>): ThElementAttributes;
    rowspan(value: string | Stateful<string>): ThElementAttributes;
    scope(value: string | Stateful<string>): ThElementAttributes;
    valign(value: string | Stateful<string>): ThElementAttributes;
    width(value: string | Stateful<string>): ThElementAttributes;
}

export interface TheadElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TheadElementAttributes;
    char(value: string | Stateful<string>): TheadElementAttributes;
    charoff(value: string | Stateful<string>): TheadElementAttributes;
    valign(value: string | Stateful<string>): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    datetime(value: string | Stateful<string>): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface TrElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    align(value: string | Stateful<string>): TrElementAttributes;
    bgcolor(value: string | Stateful<string>): TrElementAttributes;
    char(value: string | Stateful<string>): TrElementAttributes;
    charoff(value: string | Stateful<string>): TrElementAttributes;
    valign(value: string | Stateful<string>): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    default(value: boolean | Stateful<boolean>): TrackElementAttributes;
    kind(value: string | Stateful<string>): TrackElementAttributes;
    label(value: string | Stateful<string>): TrackElementAttributes;
    src(value: string | Stateful<string>): TrackElementAttributes;
    srclang(value: string | Stateful<string>): TrackElementAttributes;
}

export interface UElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface UlElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    compact(value: string | Stateful<string>): UlElementAttributes;
    type(value: string | Stateful<string>): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export interface VideoElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
    autoplay(value: boolean | Stateful<boolean>): VideoElementAttributes;
    controls(value: boolean | Stateful<boolean>): VideoElementAttributes;
    crossorigin(value: string | Stateful<string>): VideoElementAttributes;
    height(value: string | Stateful<string>): VideoElementAttributes;
    loop(value: boolean | Stateful<boolean>): VideoElementAttributes;
    muted(value: boolean | Stateful<boolean>): VideoElementAttributes;
    playsinline(value: boolean | Stateful<boolean>): VideoElementAttributes;
    poster(value: string | Stateful<string>): VideoElementAttributes;
    preload(value: string | Stateful<string>): VideoElementAttributes;
    src(value: string | Stateful<string>): VideoElementAttributes;
    width(value: string | Stateful<string>): VideoElementAttributes;
}

export interface WbrElementAttributes extends SpecialAttributes, GlobalHTMLAttributes {
}

export type AriaAttribute = "activedescendant" | "atomic" | "autocomplete" | "busy" | "checked" | "colcount" | "colindex" | "colspan" | "controls" | "current" | "describedby" | "details" | "disabled" | "dropeffect" | "errormessage" | "expanded" | "flowto" | "grabbed" | "haspopup" | "hidden" | "invalid" | "keyshortcuts" | "label" | "labelledby" | "level" | "live" | "modal" | "multiline" | "multiselectable" | "orientation" | "owns" | "placeholder" | "posinset" | "pressed" | "readonly" | "relevant" | "required" | "roledescription" | "rowcount" | "rowindex" | "rowspan" | "selected" | "setsize" | "sort" | "valuemax" | "valuemin" | "valuenow" | "valuetext" | "";

export const booleanAttributes: Set<string> = new Set();
booleanAttributes.add("allowfullscreen")
booleanAttributes.add("async")
booleanAttributes.add("autofocus")
booleanAttributes.add("autoplay")
booleanAttributes.add("checked")
booleanAttributes.add("controls")
booleanAttributes.add("default")
booleanAttributes.add("defer")
booleanAttributes.add("disabled")
booleanAttributes.add("formnovalidate")
booleanAttributes.add("inert")
booleanAttributes.add("ismap")
booleanAttributes.add("itemscope")
booleanAttributes.add("loop")
booleanAttributes.add("multiple")
booleanAttributes.add("muted")
booleanAttributes.add("nomodule")
booleanAttributes.add("novalidate")
booleanAttributes.add("open")
booleanAttributes.add("playsinline")
booleanAttributes.add("readonly")
booleanAttributes.add("required")
booleanAttributes.add("reversed")
booleanAttributes.add("selected")
