import { View, ViewElement, SpecialElements, SpecialElementBuilder, SpecialAttributes } from "./view.js";
import { Stateful } from "state-party";

export interface GlobalAttributes {
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

export interface ViewBuilder extends SpecialElementBuilder {
    a(builder?: (element: ViewElement<AElementAttributes>) => void): View;
    abbr(builder?: (element: ViewElement<AbbrElementAttributes>) => void): View;
    acronym(builder?: (element: ViewElement<AcronymElementAttributes>) => void): View;
    address(builder?: (element: ViewElement<AddressElementAttributes>) => void): View;
    applet(builder?: (element: ViewElement<AppletElementAttributes>) => void): View;
    area(builder?: (element: ViewElement<AreaElementAttributes>) => void): View;
    article(builder?: (element: ViewElement<ArticleElementAttributes>) => void): View;
    aside(builder?: (element: ViewElement<AsideElementAttributes>) => void): View;
    audio(builder?: (element: ViewElement<AudioElementAttributes>) => void): View;
    b(builder?: (element: ViewElement<BElementAttributes>) => void): View;
    base(builder?: (element: ViewElement<BaseElementAttributes>) => void): View;
    basefont(builder?: (element: ViewElement<BasefontElementAttributes>) => void): View;
    bdi(builder?: (element: ViewElement<BdiElementAttributes>) => void): View;
    bdo(builder?: (element: ViewElement<BdoElementAttributes>) => void): View;
    bgsound(builder?: (element: ViewElement<BgsoundElementAttributes>) => void): View;
    big(builder?: (element: ViewElement<BigElementAttributes>) => void): View;
    blink(builder?: (element: ViewElement<BlinkElementAttributes>) => void): View;
    blockquote(builder?: (element: ViewElement<BlockquoteElementAttributes>) => void): View;
    body(builder?: (element: ViewElement<BodyElementAttributes>) => void): View;
    br(builder?: (element: ViewElement<BrElementAttributes>) => void): View;
    button(builder?: (element: ViewElement<ButtonElementAttributes>) => void): View;
    canvas(builder?: (element: ViewElement<CanvasElementAttributes>) => void): View;
    caption(builder?: (element: ViewElement<CaptionElementAttributes>) => void): View;
    center(builder?: (element: ViewElement<CenterElementAttributes>) => void): View;
    cite(builder?: (element: ViewElement<CiteElementAttributes>) => void): View;
    code(builder?: (element: ViewElement<CodeElementAttributes>) => void): View;
    col(builder?: (element: ViewElement<ColElementAttributes>) => void): View;
    colgroup(builder?: (element: ViewElement<ColgroupElementAttributes>) => void): View;
    command(builder?: (element: ViewElement<CommandElementAttributes>) => void): View;
    content(builder?: (element: ViewElement<ContentElementAttributes>) => void): View;
    data(builder?: (element: ViewElement<DataElementAttributes>) => void): View;
    datalist(builder?: (element: ViewElement<DatalistElementAttributes>) => void): View;
    dd(builder?: (element: ViewElement<DdElementAttributes>) => void): View;
    del(builder?: (element: ViewElement<DelElementAttributes>) => void): View;
    details(builder?: (element: ViewElement<DetailsElementAttributes>) => void): View;
    dfn(builder?: (element: ViewElement<DfnElementAttributes>) => void): View;
    dialog(builder?: (element: ViewElement<DialogElementAttributes>) => void): View;
    dir(builder?: (element: ViewElement<DirElementAttributes>) => void): View;
    div(builder?: (element: ViewElement<DivElementAttributes>) => void): View;
    dl(builder?: (element: ViewElement<DlElementAttributes>) => void): View;
    dt(builder?: (element: ViewElement<DtElementAttributes>) => void): View;
    element(builder?: (element: ViewElement<ElementElementAttributes>) => void): View;
    em(builder?: (element: ViewElement<EmElementAttributes>) => void): View;
    embed(builder?: (element: ViewElement<EmbedElementAttributes>) => void): View;
    fieldset(builder?: (element: ViewElement<FieldsetElementAttributes>) => void): View;
    figcaption(builder?: (element: ViewElement<FigcaptionElementAttributes>) => void): View;
    figure(builder?: (element: ViewElement<FigureElementAttributes>) => void): View;
    font(builder?: (element: ViewElement<FontElementAttributes>) => void): View;
    footer(builder?: (element: ViewElement<FooterElementAttributes>) => void): View;
    form(builder?: (element: ViewElement<FormElementAttributes>) => void): View;
    frame(builder?: (element: ViewElement<FrameElementAttributes>) => void): View;
    frameset(builder?: (element: ViewElement<FramesetElementAttributes>) => void): View;
    h1(builder?: (element: ViewElement<H1ElementAttributes>) => void): View;
    h2(builder?: (element: ViewElement<H2ElementAttributes>) => void): View;
    h3(builder?: (element: ViewElement<H3ElementAttributes>) => void): View;
    h4(builder?: (element: ViewElement<H4ElementAttributes>) => void): View;
    h5(builder?: (element: ViewElement<H5ElementAttributes>) => void): View;
    h6(builder?: (element: ViewElement<H6ElementAttributes>) => void): View;
    head(builder?: (element: ViewElement<HeadElementAttributes>) => void): View;
    header(builder?: (element: ViewElement<HeaderElementAttributes>) => void): View;
    hgroup(builder?: (element: ViewElement<HgroupElementAttributes>) => void): View;
    hr(builder?: (element: ViewElement<HrElementAttributes>) => void): View;
    html(builder?: (element: ViewElement<HtmlElementAttributes>) => void): View;
    i(builder?: (element: ViewElement<IElementAttributes>) => void): View;
    iframe(builder?: (element: ViewElement<IframeElementAttributes>) => void): View;
    image(builder?: (element: ViewElement<ImageElementAttributes>) => void): View;
    img(builder?: (element: ViewElement<ImgElementAttributes>) => void): View;
    input(builder?: (element: ViewElement<InputElementAttributes>) => void): View;
    ins(builder?: (element: ViewElement<InsElementAttributes>) => void): View;
    isindex(builder?: (element: ViewElement<IsindexElementAttributes>) => void): View;
    kbd(builder?: (element: ViewElement<KbdElementAttributes>) => void): View;
    keygen(builder?: (element: ViewElement<KeygenElementAttributes>) => void): View;
    label(builder?: (element: ViewElement<LabelElementAttributes>) => void): View;
    legend(builder?: (element: ViewElement<LegendElementAttributes>) => void): View;
    li(builder?: (element: ViewElement<LiElementAttributes>) => void): View;
    link(builder?: (element: ViewElement<LinkElementAttributes>) => void): View;
    listing(builder?: (element: ViewElement<ListingElementAttributes>) => void): View;
    main(builder?: (element: ViewElement<MainElementAttributes>) => void): View;
    map(builder?: (element: ViewElement<MapElementAttributes>) => void): View;
    mark(builder?: (element: ViewElement<MarkElementAttributes>) => void): View;
    marquee(builder?: (element: ViewElement<MarqueeElementAttributes>) => void): View;
    math(builder?: (element: ViewElement<MathElementAttributes>) => void): View;
    menu(builder?: (element: ViewElement<MenuElementAttributes>) => void): View;
    menuitem(builder?: (element: ViewElement<MenuitemElementAttributes>) => void): View;
    meta(builder?: (element: ViewElement<MetaElementAttributes>) => void): View;
    meter(builder?: (element: ViewElement<MeterElementAttributes>) => void): View;
    multicol(builder?: (element: ViewElement<MulticolElementAttributes>) => void): View;
    nav(builder?: (element: ViewElement<NavElementAttributes>) => void): View;
    nextid(builder?: (element: ViewElement<NextidElementAttributes>) => void): View;
    nobr(builder?: (element: ViewElement<NobrElementAttributes>) => void): View;
    noembed(builder?: (element: ViewElement<NoembedElementAttributes>) => void): View;
    noframes(builder?: (element: ViewElement<NoframesElementAttributes>) => void): View;
    noscript(builder?: (element: ViewElement<NoscriptElementAttributes>) => void): View;
    object(builder?: (element: ViewElement<ObjectElementAttributes>) => void): View;
    ol(builder?: (element: ViewElement<OlElementAttributes>) => void): View;
    optgroup(builder?: (element: ViewElement<OptgroupElementAttributes>) => void): View;
    option(builder?: (element: ViewElement<OptionElementAttributes>) => void): View;
    output(builder?: (element: ViewElement<OutputElementAttributes>) => void): View;
    p(builder?: (element: ViewElement<PElementAttributes>) => void): View;
    param(builder?: (element: ViewElement<ParamElementAttributes>) => void): View;
    picture(builder?: (element: ViewElement<PictureElementAttributes>) => void): View;
    plaintext(builder?: (element: ViewElement<PlaintextElementAttributes>) => void): View;
    pre(builder?: (element: ViewElement<PreElementAttributes>) => void): View;
    progress(builder?: (element: ViewElement<ProgressElementAttributes>) => void): View;
    q(builder?: (element: ViewElement<QElementAttributes>) => void): View;
    rb(builder?: (element: ViewElement<RbElementAttributes>) => void): View;
    rbc(builder?: (element: ViewElement<RbcElementAttributes>) => void): View;
    rp(builder?: (element: ViewElement<RpElementAttributes>) => void): View;
    rt(builder?: (element: ViewElement<RtElementAttributes>) => void): View;
    rtc(builder?: (element: ViewElement<RtcElementAttributes>) => void): View;
    ruby(builder?: (element: ViewElement<RubyElementAttributes>) => void): View;
    s(builder?: (element: ViewElement<SElementAttributes>) => void): View;
    samp(builder?: (element: ViewElement<SampElementAttributes>) => void): View;
    script(builder?: (element: ViewElement<ScriptElementAttributes>) => void): View;
    search(builder?: (element: ViewElement<SearchElementAttributes>) => void): View;
    section(builder?: (element: ViewElement<SectionElementAttributes>) => void): View;
    select(builder?: (element: ViewElement<SelectElementAttributes>) => void): View;
    shadow(builder?: (element: ViewElement<ShadowElementAttributes>) => void): View;
    slot(builder?: (element: ViewElement<SlotElementAttributes>) => void): View;
    small(builder?: (element: ViewElement<SmallElementAttributes>) => void): View;
    source(builder?: (element: ViewElement<SourceElementAttributes>) => void): View;
    spacer(builder?: (element: ViewElement<SpacerElementAttributes>) => void): View;
    span(builder?: (element: ViewElement<SpanElementAttributes>) => void): View;
    strike(builder?: (element: ViewElement<StrikeElementAttributes>) => void): View;
    strong(builder?: (element: ViewElement<StrongElementAttributes>) => void): View;
    style(builder?: (element: ViewElement<StyleElementAttributes>) => void): View;
    sub(builder?: (element: ViewElement<SubElementAttributes>) => void): View;
    summary(builder?: (element: ViewElement<SummaryElementAttributes>) => void): View;
    sup(builder?: (element: ViewElement<SupElementAttributes>) => void): View;
    svg(builder?: (element: ViewElement<SvgElementAttributes>) => void): View;
    table(builder?: (element: ViewElement<TableElementAttributes>) => void): View;
    tbody(builder?: (element: ViewElement<TbodyElementAttributes>) => void): View;
    td(builder?: (element: ViewElement<TdElementAttributes>) => void): View;
    template(builder?: (element: ViewElement<TemplateElementAttributes>) => void): View;
    textarea(builder?: (element: ViewElement<TextareaElementAttributes>) => void): View;
    tfoot(builder?: (element: ViewElement<TfootElementAttributes>) => void): View;
    th(builder?: (element: ViewElement<ThElementAttributes>) => void): View;
    thead(builder?: (element: ViewElement<TheadElementAttributes>) => void): View;
    time(builder?: (element: ViewElement<TimeElementAttributes>) => void): View;
    title(builder?: (element: ViewElement<TitleElementAttributes>) => void): View;
    tr(builder?: (element: ViewElement<TrElementAttributes>) => void): View;
    track(builder?: (element: ViewElement<TrackElementAttributes>) => void): View;
    tt(builder?: (element: ViewElement<TtElementAttributes>) => void): View;
    u(builder?: (element: ViewElement<UElementAttributes>) => void): View;
    ul(builder?: (element: ViewElement<UlElementAttributes>) => void): View;
    var(builder?: (element: ViewElement<VarElementAttributes>) => void): View;
    video(builder?: (element: ViewElement<VideoElementAttributes>) => void): View;
    wbr(builder?: (element: ViewElement<WbrElementAttributes>) => void): View;
    xmp(builder?: (element: ViewElement<XmpElementAttributes>) => void): View;
}

export interface ViewElements extends SpecialElements {
    a(builder?: (element: ViewElement<AElementAttributes>) => void): this;
    abbr(builder?: (element: ViewElement<AbbrElementAttributes>) => void): this;
    acronym(builder?: (element: ViewElement<AcronymElementAttributes>) => void): this;
    address(builder?: (element: ViewElement<AddressElementAttributes>) => void): this;
    applet(builder?: (element: ViewElement<AppletElementAttributes>) => void): this;
    area(builder?: (element: ViewElement<AreaElementAttributes>) => void): this;
    article(builder?: (element: ViewElement<ArticleElementAttributes>) => void): this;
    aside(builder?: (element: ViewElement<AsideElementAttributes>) => void): this;
    audio(builder?: (element: ViewElement<AudioElementAttributes>) => void): this;
    b(builder?: (element: ViewElement<BElementAttributes>) => void): this;
    base(builder?: (element: ViewElement<BaseElementAttributes>) => void): this;
    basefont(builder?: (element: ViewElement<BasefontElementAttributes>) => void): this;
    bdi(builder?: (element: ViewElement<BdiElementAttributes>) => void): this;
    bdo(builder?: (element: ViewElement<BdoElementAttributes>) => void): this;
    bgsound(builder?: (element: ViewElement<BgsoundElementAttributes>) => void): this;
    big(builder?: (element: ViewElement<BigElementAttributes>) => void): this;
    blink(builder?: (element: ViewElement<BlinkElementAttributes>) => void): this;
    blockquote(builder?: (element: ViewElement<BlockquoteElementAttributes>) => void): this;
    body(builder?: (element: ViewElement<BodyElementAttributes>) => void): this;
    br(builder?: (element: ViewElement<BrElementAttributes>) => void): this;
    button(builder?: (element: ViewElement<ButtonElementAttributes>) => void): this;
    canvas(builder?: (element: ViewElement<CanvasElementAttributes>) => void): this;
    caption(builder?: (element: ViewElement<CaptionElementAttributes>) => void): this;
    center(builder?: (element: ViewElement<CenterElementAttributes>) => void): this;
    cite(builder?: (element: ViewElement<CiteElementAttributes>) => void): this;
    code(builder?: (element: ViewElement<CodeElementAttributes>) => void): this;
    col(builder?: (element: ViewElement<ColElementAttributes>) => void): this;
    colgroup(builder?: (element: ViewElement<ColgroupElementAttributes>) => void): this;
    command(builder?: (element: ViewElement<CommandElementAttributes>) => void): this;
    content(builder?: (element: ViewElement<ContentElementAttributes>) => void): this;
    data(builder?: (element: ViewElement<DataElementAttributes>) => void): this;
    datalist(builder?: (element: ViewElement<DatalistElementAttributes>) => void): this;
    dd(builder?: (element: ViewElement<DdElementAttributes>) => void): this;
    del(builder?: (element: ViewElement<DelElementAttributes>) => void): this;
    details(builder?: (element: ViewElement<DetailsElementAttributes>) => void): this;
    dfn(builder?: (element: ViewElement<DfnElementAttributes>) => void): this;
    dialog(builder?: (element: ViewElement<DialogElementAttributes>) => void): this;
    dir(builder?: (element: ViewElement<DirElementAttributes>) => void): this;
    div(builder?: (element: ViewElement<DivElementAttributes>) => void): this;
    dl(builder?: (element: ViewElement<DlElementAttributes>) => void): this;
    dt(builder?: (element: ViewElement<DtElementAttributes>) => void): this;
    element(builder?: (element: ViewElement<ElementElementAttributes>) => void): this;
    em(builder?: (element: ViewElement<EmElementAttributes>) => void): this;
    embed(builder?: (element: ViewElement<EmbedElementAttributes>) => void): this;
    fieldset(builder?: (element: ViewElement<FieldsetElementAttributes>) => void): this;
    figcaption(builder?: (element: ViewElement<FigcaptionElementAttributes>) => void): this;
    figure(builder?: (element: ViewElement<FigureElementAttributes>) => void): this;
    font(builder?: (element: ViewElement<FontElementAttributes>) => void): this;
    footer(builder?: (element: ViewElement<FooterElementAttributes>) => void): this;
    form(builder?: (element: ViewElement<FormElementAttributes>) => void): this;
    frame(builder?: (element: ViewElement<FrameElementAttributes>) => void): this;
    frameset(builder?: (element: ViewElement<FramesetElementAttributes>) => void): this;
    h1(builder?: (element: ViewElement<H1ElementAttributes>) => void): this;
    h2(builder?: (element: ViewElement<H2ElementAttributes>) => void): this;
    h3(builder?: (element: ViewElement<H3ElementAttributes>) => void): this;
    h4(builder?: (element: ViewElement<H4ElementAttributes>) => void): this;
    h5(builder?: (element: ViewElement<H5ElementAttributes>) => void): this;
    h6(builder?: (element: ViewElement<H6ElementAttributes>) => void): this;
    head(builder?: (element: ViewElement<HeadElementAttributes>) => void): this;
    header(builder?: (element: ViewElement<HeaderElementAttributes>) => void): this;
    hgroup(builder?: (element: ViewElement<HgroupElementAttributes>) => void): this;
    hr(builder?: (element: ViewElement<HrElementAttributes>) => void): this;
    html(builder?: (element: ViewElement<HtmlElementAttributes>) => void): this;
    i(builder?: (element: ViewElement<IElementAttributes>) => void): this;
    iframe(builder?: (element: ViewElement<IframeElementAttributes>) => void): this;
    image(builder?: (element: ViewElement<ImageElementAttributes>) => void): this;
    img(builder?: (element: ViewElement<ImgElementAttributes>) => void): this;
    input(builder?: (element: ViewElement<InputElementAttributes>) => void): this;
    ins(builder?: (element: ViewElement<InsElementAttributes>) => void): this;
    isindex(builder?: (element: ViewElement<IsindexElementAttributes>) => void): this;
    kbd(builder?: (element: ViewElement<KbdElementAttributes>) => void): this;
    keygen(builder?: (element: ViewElement<KeygenElementAttributes>) => void): this;
    label(builder?: (element: ViewElement<LabelElementAttributes>) => void): this;
    legend(builder?: (element: ViewElement<LegendElementAttributes>) => void): this;
    li(builder?: (element: ViewElement<LiElementAttributes>) => void): this;
    link(builder?: (element: ViewElement<LinkElementAttributes>) => void): this;
    listing(builder?: (element: ViewElement<ListingElementAttributes>) => void): this;
    main(builder?: (element: ViewElement<MainElementAttributes>) => void): this;
    map(builder?: (element: ViewElement<MapElementAttributes>) => void): this;
    mark(builder?: (element: ViewElement<MarkElementAttributes>) => void): this;
    marquee(builder?: (element: ViewElement<MarqueeElementAttributes>) => void): this;
    math(builder?: (element: ViewElement<MathElementAttributes>) => void): this;
    menu(builder?: (element: ViewElement<MenuElementAttributes>) => void): this;
    menuitem(builder?: (element: ViewElement<MenuitemElementAttributes>) => void): this;
    meta(builder?: (element: ViewElement<MetaElementAttributes>) => void): this;
    meter(builder?: (element: ViewElement<MeterElementAttributes>) => void): this;
    multicol(builder?: (element: ViewElement<MulticolElementAttributes>) => void): this;
    nav(builder?: (element: ViewElement<NavElementAttributes>) => void): this;
    nextid(builder?: (element: ViewElement<NextidElementAttributes>) => void): this;
    nobr(builder?: (element: ViewElement<NobrElementAttributes>) => void): this;
    noembed(builder?: (element: ViewElement<NoembedElementAttributes>) => void): this;
    noframes(builder?: (element: ViewElement<NoframesElementAttributes>) => void): this;
    noscript(builder?: (element: ViewElement<NoscriptElementAttributes>) => void): this;
    object(builder?: (element: ViewElement<ObjectElementAttributes>) => void): this;
    ol(builder?: (element: ViewElement<OlElementAttributes>) => void): this;
    optgroup(builder?: (element: ViewElement<OptgroupElementAttributes>) => void): this;
    option(builder?: (element: ViewElement<OptionElementAttributes>) => void): this;
    output(builder?: (element: ViewElement<OutputElementAttributes>) => void): this;
    p(builder?: (element: ViewElement<PElementAttributes>) => void): this;
    param(builder?: (element: ViewElement<ParamElementAttributes>) => void): this;
    picture(builder?: (element: ViewElement<PictureElementAttributes>) => void): this;
    plaintext(builder?: (element: ViewElement<PlaintextElementAttributes>) => void): this;
    pre(builder?: (element: ViewElement<PreElementAttributes>) => void): this;
    progress(builder?: (element: ViewElement<ProgressElementAttributes>) => void): this;
    q(builder?: (element: ViewElement<QElementAttributes>) => void): this;
    rb(builder?: (element: ViewElement<RbElementAttributes>) => void): this;
    rbc(builder?: (element: ViewElement<RbcElementAttributes>) => void): this;
    rp(builder?: (element: ViewElement<RpElementAttributes>) => void): this;
    rt(builder?: (element: ViewElement<RtElementAttributes>) => void): this;
    rtc(builder?: (element: ViewElement<RtcElementAttributes>) => void): this;
    ruby(builder?: (element: ViewElement<RubyElementAttributes>) => void): this;
    s(builder?: (element: ViewElement<SElementAttributes>) => void): this;
    samp(builder?: (element: ViewElement<SampElementAttributes>) => void): this;
    script(builder?: (element: ViewElement<ScriptElementAttributes>) => void): this;
    search(builder?: (element: ViewElement<SearchElementAttributes>) => void): this;
    section(builder?: (element: ViewElement<SectionElementAttributes>) => void): this;
    select(builder?: (element: ViewElement<SelectElementAttributes>) => void): this;
    shadow(builder?: (element: ViewElement<ShadowElementAttributes>) => void): this;
    slot(builder?: (element: ViewElement<SlotElementAttributes>) => void): this;
    small(builder?: (element: ViewElement<SmallElementAttributes>) => void): this;
    source(builder?: (element: ViewElement<SourceElementAttributes>) => void): this;
    spacer(builder?: (element: ViewElement<SpacerElementAttributes>) => void): this;
    span(builder?: (element: ViewElement<SpanElementAttributes>) => void): this;
    strike(builder?: (element: ViewElement<StrikeElementAttributes>) => void): this;
    strong(builder?: (element: ViewElement<StrongElementAttributes>) => void): this;
    style(builder?: (element: ViewElement<StyleElementAttributes>) => void): this;
    sub(builder?: (element: ViewElement<SubElementAttributes>) => void): this;
    summary(builder?: (element: ViewElement<SummaryElementAttributes>) => void): this;
    sup(builder?: (element: ViewElement<SupElementAttributes>) => void): this;
    svg(builder?: (element: ViewElement<SvgElementAttributes>) => void): this;
    table(builder?: (element: ViewElement<TableElementAttributes>) => void): this;
    tbody(builder?: (element: ViewElement<TbodyElementAttributes>) => void): this;
    td(builder?: (element: ViewElement<TdElementAttributes>) => void): this;
    template(builder?: (element: ViewElement<TemplateElementAttributes>) => void): this;
    textarea(builder?: (element: ViewElement<TextareaElementAttributes>) => void): this;
    tfoot(builder?: (element: ViewElement<TfootElementAttributes>) => void): this;
    th(builder?: (element: ViewElement<ThElementAttributes>) => void): this;
    thead(builder?: (element: ViewElement<TheadElementAttributes>) => void): this;
    time(builder?: (element: ViewElement<TimeElementAttributes>) => void): this;
    title(builder?: (element: ViewElement<TitleElementAttributes>) => void): this;
    tr(builder?: (element: ViewElement<TrElementAttributes>) => void): this;
    track(builder?: (element: ViewElement<TrackElementAttributes>) => void): this;
    tt(builder?: (element: ViewElement<TtElementAttributes>) => void): this;
    u(builder?: (element: ViewElement<UElementAttributes>) => void): this;
    ul(builder?: (element: ViewElement<UlElementAttributes>) => void): this;
    var(builder?: (element: ViewElement<VarElementAttributes>) => void): this;
    video(builder?: (element: ViewElement<VideoElementAttributes>) => void): this;
    wbr(builder?: (element: ViewElement<WbrElementAttributes>) => void): this;
    xmp(builder?: (element: ViewElement<XmpElementAttributes>) => void): this;
}

export interface AElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface AbbrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AcronymElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AddressElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AppletElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): AppletElementAttributes;
    alt(value: string | Stateful<string>): AppletElementAttributes;
    archive(value: string | Stateful<string>): AppletElementAttributes;
    code(value: string | Stateful<string>): AppletElementAttributes;
    codebase(value: string | Stateful<string>): AppletElementAttributes;
    height(value: string | Stateful<string>): AppletElementAttributes;
    hspace(value: string | Stateful<string>): AppletElementAttributes;
    name(value: string | Stateful<string>): AppletElementAttributes;
    object(value: string | Stateful<string>): AppletElementAttributes;
    vspace(value: string | Stateful<string>): AppletElementAttributes;
    width(value: string | Stateful<string>): AppletElementAttributes;
}

export interface AreaElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface ArticleElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AsideElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface AudioElementAttributes extends SpecialAttributes, GlobalAttributes {
    autoplay(value: boolean | Stateful<boolean>): AudioElementAttributes;
    controls(value: boolean | Stateful<boolean>): AudioElementAttributes;
    crossorigin(value: string | Stateful<string>): AudioElementAttributes;
    loop(value: boolean | Stateful<boolean>): AudioElementAttributes;
    muted(value: boolean | Stateful<boolean>): AudioElementAttributes;
    preload(value: string | Stateful<string>): AudioElementAttributes;
    src(value: string | Stateful<string>): AudioElementAttributes;
}

export interface BElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BaseElementAttributes extends SpecialAttributes, GlobalAttributes {
    href(value: string | Stateful<string>): BaseElementAttributes;
    target(value: string | Stateful<string>): BaseElementAttributes;
}

export interface BasefontElementAttributes extends SpecialAttributes, GlobalAttributes {
    color(value: string | Stateful<string>): BasefontElementAttributes;
    face(value: string | Stateful<string>): BasefontElementAttributes;
    size(value: string | Stateful<string>): BasefontElementAttributes;
}

export interface BdiElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BdoElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BgsoundElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BigElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BlinkElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface BlockquoteElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string | Stateful<string>): BlockquoteElementAttributes;
}

export interface BodyElementAttributes extends SpecialAttributes, GlobalAttributes {
    alink(value: string | Stateful<string>): BodyElementAttributes;
    background(value: string | Stateful<string>): BodyElementAttributes;
    bgcolor(value: string | Stateful<string>): BodyElementAttributes;
    link(value: string | Stateful<string>): BodyElementAttributes;
    text(value: string | Stateful<string>): BodyElementAttributes;
    vlink(value: string | Stateful<string>): BodyElementAttributes;
}

export interface BrElementAttributes extends SpecialAttributes, GlobalAttributes {
    clear(value: string | Stateful<string>): BrElementAttributes;
}

export interface ButtonElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface CanvasElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string | Stateful<string>): CanvasElementAttributes;
    width(value: string | Stateful<string>): CanvasElementAttributes;
}

export interface CaptionElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): CaptionElementAttributes;
}

export interface CenterElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface CiteElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface CodeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ColElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): ColElementAttributes;
    char(value: string | Stateful<string>): ColElementAttributes;
    charoff(value: string | Stateful<string>): ColElementAttributes;
    span(value: string | Stateful<string>): ColElementAttributes;
    valign(value: string | Stateful<string>): ColElementAttributes;
    width(value: string | Stateful<string>): ColElementAttributes;
}

export interface ColgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): ColgroupElementAttributes;
    char(value: string | Stateful<string>): ColgroupElementAttributes;
    charoff(value: string | Stateful<string>): ColgroupElementAttributes;
    span(value: string | Stateful<string>): ColgroupElementAttributes;
    valign(value: string | Stateful<string>): ColgroupElementAttributes;
    width(value: string | Stateful<string>): ColgroupElementAttributes;
}

export interface CommandElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ContentElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DataElementAttributes extends SpecialAttributes, GlobalAttributes {
    value(value: string | Stateful<string>): DataElementAttributes;
}

export interface DatalistElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DdElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DelElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string | Stateful<string>): DelElementAttributes;
    datetime(value: string | Stateful<string>): DelElementAttributes;
}

export interface DetailsElementAttributes extends SpecialAttributes, GlobalAttributes {
    open(value: boolean | Stateful<boolean>): DetailsElementAttributes;
}

export interface DfnElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface DialogElementAttributes extends SpecialAttributes, GlobalAttributes {
    open(value: boolean | Stateful<boolean>): DialogElementAttributes;
}

export interface DirElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string | Stateful<string>): DirElementAttributes;
}

export interface DivElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): DivElementAttributes;
}

export interface DlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string | Stateful<string>): DlElementAttributes;
}

export interface DtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ElementElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface EmElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface EmbedElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string | Stateful<string>): EmbedElementAttributes;
    src(value: string | Stateful<string>): EmbedElementAttributes;
    type(value: string | Stateful<string>): EmbedElementAttributes;
    width(value: string | Stateful<string>): EmbedElementAttributes;
}

export interface FieldsetElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean | Stateful<boolean>): FieldsetElementAttributes;
    form(value: string | Stateful<string>): FieldsetElementAttributes;
    name(value: string | Stateful<string>): FieldsetElementAttributes;
}

export interface FigcaptionElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FigureElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FontElementAttributes extends SpecialAttributes, GlobalAttributes {
    color(value: string | Stateful<string>): FontElementAttributes;
    face(value: string | Stateful<string>): FontElementAttributes;
    size(value: string | Stateful<string>): FontElementAttributes;
}

export interface FooterElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface FormElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface FrameElementAttributes extends SpecialAttributes, GlobalAttributes {
    frameborder(value: string | Stateful<string>): FrameElementAttributes;
    longdesc(value: string | Stateful<string>): FrameElementAttributes;
    marginheight(value: string | Stateful<string>): FrameElementAttributes;
    marginwidth(value: string | Stateful<string>): FrameElementAttributes;
    name(value: string | Stateful<string>): FrameElementAttributes;
    noresize(value: string | Stateful<string>): FrameElementAttributes;
    scrolling(value: string | Stateful<string>): FrameElementAttributes;
    src(value: string | Stateful<string>): FrameElementAttributes;
}

export interface FramesetElementAttributes extends SpecialAttributes, GlobalAttributes {
    cols(value: string | Stateful<string>): FramesetElementAttributes;
    rows(value: string | Stateful<string>): FramesetElementAttributes;
}

export interface H1ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H1ElementAttributes;
}

export interface H2ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H2ElementAttributes;
}

export interface H3ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H3ElementAttributes;
}

export interface H4ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H4ElementAttributes;
}

export interface H5ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H5ElementAttributes;
}

export interface H6ElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): H6ElementAttributes;
}

export interface HeadElementAttributes extends SpecialAttributes, GlobalAttributes {
    profile(value: string | Stateful<string>): HeadElementAttributes;
}

export interface HeaderElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface HgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface HrElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): HrElementAttributes;
    noshade(value: string | Stateful<string>): HrElementAttributes;
    size(value: string | Stateful<string>): HrElementAttributes;
    width(value: string | Stateful<string>): HrElementAttributes;
}

export interface HtmlElementAttributes extends SpecialAttributes, GlobalAttributes {
    manifest(value: string | Stateful<string>): HtmlElementAttributes;
    version(value: string | Stateful<string>): HtmlElementAttributes;
}

export interface IElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface IframeElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface ImageElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ImgElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface InputElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface InsElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string | Stateful<string>): InsElementAttributes;
    datetime(value: string | Stateful<string>): InsElementAttributes;
}

export interface IsindexElementAttributes extends SpecialAttributes, GlobalAttributes {
    prompt(value: string | Stateful<string>): IsindexElementAttributes;
}

export interface KbdElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface KeygenElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface LabelElementAttributes extends SpecialAttributes, GlobalAttributes {
    for(value: string | Stateful<string>): LabelElementAttributes;
    form(value: string | Stateful<string>): LabelElementAttributes;
}

export interface LegendElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): LegendElementAttributes;
}

export interface LiElementAttributes extends SpecialAttributes, GlobalAttributes {
    type(value: string | Stateful<string>): LiElementAttributes;
    value(value: string | Stateful<string>): LiElementAttributes;
}

export interface LinkElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface ListingElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MainElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MapElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string | Stateful<string>): MapElementAttributes;
}

export interface MarkElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MarqueeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MathElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MenuElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string | Stateful<string>): MenuElementAttributes;
}

export interface MenuitemElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface MetaElementAttributes extends SpecialAttributes, GlobalAttributes {
    charset(value: string | Stateful<string>): MetaElementAttributes;
    content(value: string | Stateful<string>): MetaElementAttributes;
    httpEquiv(value: string | Stateful<string>): MetaElementAttributes;
    media(value: string | Stateful<string>): MetaElementAttributes;
    name(value: string | Stateful<string>): MetaElementAttributes;
    scheme(value: string | Stateful<string>): MetaElementAttributes;
}

export interface MeterElementAttributes extends SpecialAttributes, GlobalAttributes {
    high(value: string | Stateful<string>): MeterElementAttributes;
    low(value: string | Stateful<string>): MeterElementAttributes;
    max(value: string | Stateful<string>): MeterElementAttributes;
    min(value: string | Stateful<string>): MeterElementAttributes;
    optimum(value: string | Stateful<string>): MeterElementAttributes;
    value(value: string | Stateful<string>): MeterElementAttributes;
}

export interface MulticolElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NavElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NextidElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NobrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoembedElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoframesElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface NoscriptElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ObjectElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface OlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string | Stateful<string>): OlElementAttributes;
    reversed(value: boolean | Stateful<boolean>): OlElementAttributes;
    start(value: string | Stateful<string>): OlElementAttributes;
    type(value: string | Stateful<string>): OlElementAttributes;
}

export interface OptgroupElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean | Stateful<boolean>): OptgroupElementAttributes;
    label(value: string | Stateful<string>): OptgroupElementAttributes;
}

export interface OptionElementAttributes extends SpecialAttributes, GlobalAttributes {
    disabled(value: boolean | Stateful<boolean>): OptionElementAttributes;
    label(value: string | Stateful<string>): OptionElementAttributes;
    selected(value: boolean | Stateful<boolean>): OptionElementAttributes;
    value(value: string | Stateful<string>): OptionElementAttributes;
}

export interface OutputElementAttributes extends SpecialAttributes, GlobalAttributes {
    for(value: string | Stateful<string>): OutputElementAttributes;
    form(value: string | Stateful<string>): OutputElementAttributes;
    name(value: string | Stateful<string>): OutputElementAttributes;
}

export interface PElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): PElementAttributes;
}

export interface ParamElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string | Stateful<string>): ParamElementAttributes;
    type(value: string | Stateful<string>): ParamElementAttributes;
    value(value: string | Stateful<string>): ParamElementAttributes;
    valuetype(value: string | Stateful<string>): ParamElementAttributes;
}

export interface PictureElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface PlaintextElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface PreElementAttributes extends SpecialAttributes, GlobalAttributes {
    width(value: string | Stateful<string>): PreElementAttributes;
}

export interface ProgressElementAttributes extends SpecialAttributes, GlobalAttributes {
    max(value: string | Stateful<string>): ProgressElementAttributes;
    value(value: string | Stateful<string>): ProgressElementAttributes;
}

export interface QElementAttributes extends SpecialAttributes, GlobalAttributes {
    cite(value: string | Stateful<string>): QElementAttributes;
}

export interface RbElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RbcElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RpElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RtcElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface RubyElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SampElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface ScriptElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface SearchElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SectionElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SelectElementAttributes extends SpecialAttributes, GlobalAttributes {
    autocomplete(value: string | Stateful<string>): SelectElementAttributes;
    disabled(value: boolean | Stateful<boolean>): SelectElementAttributes;
    form(value: string | Stateful<string>): SelectElementAttributes;
    multiple(value: boolean | Stateful<boolean>): SelectElementAttributes;
    name(value: string | Stateful<string>): SelectElementAttributes;
    required(value: boolean | Stateful<boolean>): SelectElementAttributes;
    size(value: string | Stateful<string>): SelectElementAttributes;
}

export interface ShadowElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SlotElementAttributes extends SpecialAttributes, GlobalAttributes {
    name(value: string | Stateful<string>): SlotElementAttributes;
}

export interface SmallElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SourceElementAttributes extends SpecialAttributes, GlobalAttributes {
    height(value: string | Stateful<string>): SourceElementAttributes;
    media(value: string | Stateful<string>): SourceElementAttributes;
    sizes(value: string | Stateful<string>): SourceElementAttributes;
    src(value: string | Stateful<string>): SourceElementAttributes;
    srcset(value: string | Stateful<string>): SourceElementAttributes;
    type(value: string | Stateful<string>): SourceElementAttributes;
    width(value: string | Stateful<string>): SourceElementAttributes;
}

export interface SpacerElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SpanElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StrikeElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StrongElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface StyleElementAttributes extends SpecialAttributes, GlobalAttributes {
    blocking(value: string | Stateful<string>): StyleElementAttributes;
    media(value: string | Stateful<string>): StyleElementAttributes;
    type(value: string | Stateful<string>): StyleElementAttributes;
}

export interface SubElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SummaryElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SupElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface SvgElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TableElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface TbodyElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): TbodyElementAttributes;
    char(value: string | Stateful<string>): TbodyElementAttributes;
    charoff(value: string | Stateful<string>): TbodyElementAttributes;
    valign(value: string | Stateful<string>): TbodyElementAttributes;
}

export interface TdElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface TemplateElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TextareaElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface TfootElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): TfootElementAttributes;
    char(value: string | Stateful<string>): TfootElementAttributes;
    charoff(value: string | Stateful<string>): TfootElementAttributes;
    valign(value: string | Stateful<string>): TfootElementAttributes;
}

export interface ThElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface TheadElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): TheadElementAttributes;
    char(value: string | Stateful<string>): TheadElementAttributes;
    charoff(value: string | Stateful<string>): TheadElementAttributes;
    valign(value: string | Stateful<string>): TheadElementAttributes;
}

export interface TimeElementAttributes extends SpecialAttributes, GlobalAttributes {
    datetime(value: string | Stateful<string>): TimeElementAttributes;
}

export interface TitleElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface TrElementAttributes extends SpecialAttributes, GlobalAttributes {
    align(value: string | Stateful<string>): TrElementAttributes;
    bgcolor(value: string | Stateful<string>): TrElementAttributes;
    char(value: string | Stateful<string>): TrElementAttributes;
    charoff(value: string | Stateful<string>): TrElementAttributes;
    valign(value: string | Stateful<string>): TrElementAttributes;
}

export interface TrackElementAttributes extends SpecialAttributes, GlobalAttributes {
    default(value: boolean | Stateful<boolean>): TrackElementAttributes;
    kind(value: string | Stateful<string>): TrackElementAttributes;
    label(value: string | Stateful<string>): TrackElementAttributes;
    src(value: string | Stateful<string>): TrackElementAttributes;
    srclang(value: string | Stateful<string>): TrackElementAttributes;
}

export interface TtElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface UElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface UlElementAttributes extends SpecialAttributes, GlobalAttributes {
    compact(value: string | Stateful<string>): UlElementAttributes;
    type(value: string | Stateful<string>): UlElementAttributes;
}

export interface VarElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface VideoElementAttributes extends SpecialAttributes, GlobalAttributes {
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

export interface WbrElementAttributes extends SpecialAttributes, GlobalAttributes {
}

export interface XmpElementAttributes extends SpecialAttributes, GlobalAttributes {
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
